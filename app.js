/* ===== ORDEM DE SERVIÇO — JCE TRANSPORTES ===== */

// ───────────────────────────────────────────
// OS NUMBER (localStorage auto-increment)
// ───────────────────────────────────────────
function getNextOS() {
  let num = parseInt(localStorage.getItem('jce_os_counter') || '0') + 1;
  localStorage.setItem('jce_os_counter', num);
  return String(num).padStart(5, '0');
}

function setOSTag() {
  const tag = document.getElementById('os-number');
  const num = localStorage.getItem('jce_os_counter') || '00001';
  tag.textContent = 'OS Nº ' + String(parseInt(num) + 1).padStart(5, '0');
}

// ───────────────────────────────────────────
// TIPO EQUIPAMENTO TOGGLE
// ───────────────────────────────────────────
function setupTipoToggle() {
  const btnV = document.getElementById('btn-vanderleia');
  const btnR = document.getElementById('btn-rodotrem');
  const sr1  = document.getElementById('block-sr1');
  const sr2  = document.getElementById('block-sr2');

  function activate(tipo) {
    if (tipo === 'vanderleia') {
      btnV.classList.add('active');
      btnR.classList.remove('active');
      sr2.classList.remove('visible');
      document.getElementById('label-sr1').textContent = 'Semi-Reboque';
      document.getElementById('placa-sr1-label').textContent = 'Placa Semi-Reboque';
    } else {
      btnR.classList.add('active');
      btnV.classList.remove('active');
      sr2.classList.add('visible');
      document.getElementById('label-sr1').textContent = 'Semi-Reboque 1';
      document.getElementById('placa-sr1-label').textContent = 'Placa Semi-Reboque 1';
    }
    sr1.classList.add('visible');
  }

  btnV.addEventListener('click', () => activate('vanderleia'));
  btnR.addEventListener('click', () => activate('rodotrem'));

  // Default: vanderleia
  activate('vanderleia');
}

// ───────────────────────────────────────────
// PREENCHER DATA/HORA ATUAL
// ───────────────────────────────────────────
function setDefaultDateTime() {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  document.getElementById('data').value = dateStr;
  document.getElementById('hora').value = timeStr;
}

// ───────────────────────────────────────────
// HELPERS DE TEXTO
// ───────────────────────────────────────────
function fmtDate(val) {
  if (!val) return '___/___/______';
  const [y, m, d] = val.split('-');
  return `${d}/${m}/${y}`;
}

function isRodotrem() {
  return document.getElementById('btn-rodotrem').classList.contains('active');
}

// ───────────────────────────────────────────
// PDF GENERATION
// ───────────────────────────────────────────
function gerarPDF() {
  const data     = document.getElementById('data').value;
  const hora     = document.getElementById('hora').value;
  const motorista = document.getElementById('motorista').value.trim();
  const placa_cav = document.getElementById('placa-cavalo').value.trim().toUpperCase();
  const placa_sr1 = document.getElementById('placa-sr1').value.trim().toUpperCase();
  const placa_sr2 = document.getElementById('placa-sr2').value.trim().toUpperCase();
  const serv_cav  = document.getElementById('servico-cavalo').value.trim();
  const serv_sr1  = document.getElementById('servico-sr1').value.trim();
  const serv_sr2  = document.getElementById('servico-sr2').value.trim();
  const rodotrem  = isRodotrem();
  const osNum     = getNextOS();

  // update tag display
  document.getElementById('os-number').textContent = 'OS Nº ' + String(parseInt(osNum)).padStart(5,'0');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const W = 210, marginL = 14, marginR = 196;
  let y = 0;

  // ── COLORS ──
  const blue    = [76, 200, 224];
  const blueDk  = [26, 154, 184];
  const black   = [26, 26, 26];
  const grayMd  = [120, 120, 120];
  const grayLt  = [232, 232, 232];
  const white   = [255, 255, 255];

  // ── HEADER BAR ──
  doc.setFillColor(...blue);
  doc.rect(0, 0, W, 36, 'F');

  // Logo (top right)
  if (typeof LOGO_B64 !== 'undefined') {
    doc.addImage(LOGO_B64, 'PNG', W - 56, 2, 50, 32);
  }

  // Title text
  doc.setTextColor(...white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('ORDEM DE SERVIÇO', marginL, 16);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('JCE TRANSPORTES — MANUTENÇÃO VEICULAR', marginL, 24);

  // OS number badge
  doc.setFillColor(...blueDk);
  doc.roundedRect(marginL, 27, 54, 7, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...white);
  doc.text('OS Nº ' + osNum, marginL + 3, 32.5);

  y = 42;

  // ── SECTION HELPER ──
  function sectionTitle(title, yPos) {
    doc.setFillColor(...blue);
    doc.rect(marginL, yPos, 3, 7, 'F');
    doc.setTextColor(...blueDk);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), marginL + 6, yPos + 5.2);
    doc.setDrawColor(...grayLt);
    doc.setLineWidth(0.3);
    doc.line(marginL + 6 + doc.getTextWidth(title.toUpperCase()) + 3, yPos + 2.5, marginR, yPos + 2.5);
    return yPos + 12;
  }

  // ── FIELD HELPER (single row) ──
  function fieldRow(fields, yPos) {
    // fields: [{label, value, x, w}]
    fields.forEach(f => {
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(...grayLt);
      doc.setLineWidth(0.3);
      doc.roundedRect(f.x, yPos, f.w, 10, 1.5, 1.5, 'FD');
      doc.setTextColor(...grayMd);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(6.5);
      doc.text(f.label.toUpperCase(), f.x + 3, yPos + 4);
      doc.setTextColor(...black);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(f.value || '', f.x + 3, yPos + 8.5);
    });
    return yPos + 14;
  }

  // ── DADOS GERAIS ──
  y = sectionTitle('Dados da Ordem de Serviço', y);

  y = fieldRow([
    { label: 'Data', value: fmtDate(data), x: marginL, w: 44 },
    { label: 'Hora', value: hora || '', x: marginL + 48, w: 34 },
    { label: 'Tipo de Equipamento', value: rodotrem ? 'Rodotrem' : 'Vanderleia', x: marginL + 86, w: 50 },
    { label: 'Nº OS', value: osNum, x: marginL + 140, w: 42 }
  ], y);

  y = fieldRow([
    { label: 'Motorista', value: motorista, x: marginL, w: marginR - marginL }
  ], y);

  // ── PLACAS ──
  y = sectionTitle('Identificação dos Veículos', y);

  if (rodotrem) {
    y = fieldRow([
      { label: 'Placa Cavalo Mecânico', value: placa_cav, x: marginL, w: 55 },
      { label: 'Placa Semi-Reboque 1',  value: placa_sr1, x: marginL + 59, w: 55 },
      { label: 'Placa Semi-Reboque 2',  value: placa_sr2, x: marginL + 118, w: 64 }
    ], y);
  } else {
    y = fieldRow([
      { label: 'Placa Cavalo Mecânico', value: placa_cav, x: marginL, w: 86 },
      { label: 'Placa Semi-Reboque',    value: placa_sr1, x: marginL + 90, w: 92 }
    ], y);
  }

  // ── TEXTO OS HELPER ──
  function servicoBlock(title, texto, yPos) {
    const usableW = marginR - marginL;
    // title row
    doc.setFillColor(...blue);
    doc.rect(marginL, yPos, usableW, 8, 'F');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text(title.toUpperCase(), marginL + 4, yPos + 5.5);
    yPos += 8;

    // text box
    const boxH = 42;
    doc.setFillColor(252, 252, 252);
    doc.setDrawColor(...grayLt);
    doc.setLineWidth(0.3);
    doc.rect(marginL, yPos, usableW, boxH, 'FD');

    // wrap text
    if (texto) {
      doc.setTextColor(...black);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const lines = doc.splitTextToSize(texto, usableW - 8);
      doc.text(lines, marginL + 4, yPos + 6);
    }
    return yPos + boxH + 6;
  }

  // ── SERVIÇOS ──
  y = sectionTitle('Descrição dos Serviços', y);
  y = servicoBlock('Cavalo Mecânico — ' + (placa_cav || 'S/N'), serv_cav, y);

  if (rodotrem) {
    y = servicoBlock('Semi-Reboque 1 — ' + (placa_sr1 || 'S/N'), serv_sr1, y);
    y = servicoBlock('Semi-Reboque 2 — ' + (placa_sr2 || 'S/N'), serv_sr2, y);
  } else {
    y = servicoBlock('Semi-Reboque — ' + (placa_sr1 || 'S/N'), serv_sr1, y);
  }

  // ── CONCLUSÃO ──
  y = sectionTitle('Conclusão da Ordem de Serviço', y);

  // conclusão fields
  y = fieldRow([
    { label: 'Data de Conclusão', value: '', x: marginL, w: 64 },
    { label: 'Hora de Conclusão', value: '', x: marginL + 68, w: 42 },
    { label: 'Status', value: '', x: marginL + 114, w: 68 }
  ], y);

  // observações box
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(...grayLt);
  doc.setLineWidth(0.3);
  doc.rect(marginL, y, marginR - marginL, 16, 'FD');
  doc.setTextColor(...grayMd);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('OBSERVAÇÕES DE CONCLUSÃO', marginL + 3, y + 4);
  y += 20;

  // ── ASSINATURAS ──
  y = sectionTitle('Assinaturas', y);

  const sigW = (marginR - marginL - 12) / 2;
  function sigBox(label, x, yPos) {
    doc.setDrawColor(...grayLt);
    doc.setLineWidth(0.3);
    doc.setFillColor(252, 252, 252);
    doc.rect(x, yPos, sigW, 26, 'FD');
    // line
    doc.setDrawColor(...grayMd);
    doc.setLineWidth(0.4);
    doc.line(x + 8, yPos + 19, x + sigW - 8, yPos + 19);
    // label
    doc.setTextColor(...grayMd);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    const lw = doc.getTextWidth(label);
    doc.text(label, x + (sigW - lw) / 2, yPos + 23.5);
  }

  sigBox('Assinatura do Motorista', marginL, y);
  sigBox('Assinatura do Chefe de Manutenção', marginL + sigW + 12, y);

  // ── RODAPÉ ──
  doc.setFillColor(...grayLt);
  doc.rect(0, 287, W, 10, 'F');
  doc.setTextColor(...grayMd);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text('JCE Transportes — Documento gerado em ' + fmtDate(new Date().toISOString().split('T')[0]) + ' às ' + new Date().toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'}), W / 2, 293, { align: 'center' });

  // ── SAVE ──
  doc.save('OS_JCE_' + osNum + '.pdf');
}

// ───────────────────────────────────────────
// INIT
// ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  setDefaultDateTime();
  setupTipoToggle();
  setOSTag();
  document.getElementById('btn-gerar').addEventListener('click', gerarPDF);
});
