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

  // ── HEADER BAR (compacto: 28px) ──
  doc.setFillColor(...blue);
  doc.rect(0, 0, W, 28, 'F');

  if (typeof LOGO_B64 !== 'undefined') {
    doc.addImage(LOGO_B64, 'PNG', W - 48, 1, 42, 26);
  }

  doc.setTextColor(...white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('ORDEM DE SERVIÇO', marginL, 12);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('JCE TRANSPORTES — MANUTENÇÃO VEICULAR', marginL, 19);

  // badge OS
  doc.setFillColor(...blueDk);
  doc.roundedRect(marginL, 21, 46, 5.5, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...white);
  doc.text('OS Nº ' + osNum, marginL + 2, 25.2);

  y = 33;

  // ── SECTION HELPER (compacto: 9px alto) ──
  function sectionTitle(title, yPos) {
    doc.setFillColor(...blue);
    doc.rect(marginL, yPos, 3, 5.5, 'F');
    doc.setTextColor(...blueDk);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(title.toUpperCase(), marginL + 5, yPos + 4.2);
    doc.setDrawColor(...grayLt);
    doc.setLineWidth(0.25);
    doc.line(marginL + 5 + doc.getTextWidth(title.toUpperCase()) + 2, yPos + 2, marginR, yPos + 2);
    return yPos + 9;
  }

  // ── FIELD HELPER (altura 8px, espaçamento 11) ──
  function fieldRow(fields, yPos) {
    fields.forEach(f => {
      doc.setFillColor(250, 250, 250);
      doc.setDrawColor(...grayLt);
      doc.setLineWidth(0.25);
      doc.roundedRect(f.x, yPos, f.w, 8.5, 1, 1, 'FD');
      doc.setTextColor(...grayMd);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(5.8);
      doc.text(f.label.toUpperCase(), f.x + 2.5, yPos + 3.2);
      doc.setTextColor(...black);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.text(f.value || '', f.x + 2.5, yPos + 7.4);
    });
    return yPos + 11;
  }

  // ── DADOS GERAIS ──
  y = sectionTitle('Dados da Ordem de Serviço', y);

  y = fieldRow([
    { label: 'Data',               value: fmtDate(data),                   x: marginL,        w: 40 },
    { label: 'Hora',               value: hora || '',                       x: marginL + 43,   w: 28 },
    { label: 'Tipo de Equipamento',value: rodotrem ? 'Rodotrem':'Vanderleia',x: marginL + 74,  w: 44 },
    { label: 'Nº OS',              value: osNum,                            x: marginL + 121,  w: 61 }
  ], y);

  y = fieldRow([
    { label: 'Motorista', value: motorista, x: marginL, w: marginR - marginL }
  ], y);

  // ── PLACAS ──
  y = sectionTitle('Identificação dos Veículos', y);

  if (rodotrem) {
    y = fieldRow([
      { label: 'Placa Cavalo Mecânico', value: placa_cav, x: marginL,        w: 57 },
      { label: 'Placa Semi-Reboque 1',  value: placa_sr1, x: marginL + 60,   w: 57 },
      { label: 'Placa Semi-Reboque 2',  value: placa_sr2, x: marginL + 120,  w: 62 }
    ], y);
  } else {
    y = fieldRow([
      { label: 'Placa Cavalo Mecânico', value: placa_cav, x: marginL,       w: 88 },
      { label: 'Placa Semi-Reboque',    value: placa_sr1, x: marginL + 92,  w: 90 }
    ], y);
  }

  // ── SERVIÇO BLOCK (title 6px + box dinâmico) ──
  function servicoBlock(title, texto, yPos) {
    const usableW = marginR - marginL;
    doc.setFillColor(...blue);
    doc.rect(marginL, yPos, usableW, 6, 'F');
    doc.setTextColor(...white);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.text(title.toUpperCase(), marginL + 3, yPos + 4.3);
    yPos += 6;

    const boxH = 36;
    doc.setFillColor(252, 252, 252);
    doc.setDrawColor(...grayLt);
    doc.setLineWidth(0.25);
    doc.rect(marginL, yPos, usableW, boxH, 'FD');

    if (texto) {
      doc.setTextColor(...black);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const lines = doc.splitTextToSize(texto, usableW - 6);
      doc.text(lines, marginL + 3, yPos + 5.5);
    }
    return yPos + boxH + 4;
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

  y = fieldRow([
    { label: 'Data de Conclusão', value: '', x: marginL,       w: 58 },
    { label: 'Hora de Conclusão', value: '', x: marginL + 61,  w: 38 },
    { label: 'Status',            value: '', x: marginL + 102, w: 80 }
  ], y);

  // observações box compacto
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(...grayLt);
  doc.setLineWidth(0.25);
  doc.rect(marginL, y, marginR - marginL, 14, 'FD');
  doc.setTextColor(...grayMd);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(5.8);
  doc.text('OBSERVAÇÕES DE CONCLUSÃO', marginL + 2.5, y + 3.5);
  y += 17;

  // ── ASSINATURAS ──
  y = sectionTitle('Assinaturas', y);

  const usableW = marginR - marginL;
  const sigW    = (usableW - 10) / 2;
  const sigH    = 30;

  function sigBox(label, x, yPos) {
    // caixa
    doc.setFillColor(252, 252, 252);
    doc.setDrawColor(...grayLt);
    doc.setLineWidth(0.25);
    doc.rect(x, yPos, sigW, sigH, 'FD');

    // linha de assinatura
    doc.setDrawColor(...grayMd);
    doc.setLineWidth(0.35);
    doc.line(x + 6, yPos + 17, x + sigW - 6, yPos + 17);

    // rótulo abaixo da linha
    doc.setTextColor(...grayMd);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    const lw = doc.getTextWidth(label);
    doc.text(label, x + (sigW - lw) / 2, yPos + 21);

    // campos data e hora no rodapé da caixa
    const fieldW = (sigW - 12) / 2;
    doc.setFillColor(245, 245, 245);
    doc.setDrawColor(...grayLt);
    doc.setLineWidth(0.2);
    doc.roundedRect(x + 3, yPos + sigH - 7.5, fieldW, 6, 0.8, 0.8, 'FD');
    doc.roundedRect(x + 3 + fieldW + 3, yPos + sigH - 7.5, fieldW, 6, 0.8, 0.8, 'FD');

    doc.setTextColor(...grayMd);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(5.2);
    doc.text('DATA', x + 3 + 1.5, yPos + sigH - 5.5);
    doc.text('HORA', x + 3 + fieldW + 3 + 1.5, yPos + sigH - 5.5);
  }

  sigBox('Assinatura do Motorista',           marginL,              y);
  sigBox('Assinatura do Chefe de Manutenção', marginL + sigW + 10,  y);

  // ── RODAPÉ FIXO ──
  const footerY = 287;
  doc.setFillColor(...grayLt);
  doc.rect(0, footerY, W, 10, 'F');
  doc.setFillColor(...blue);
  doc.rect(0, footerY, 4, 10, 'F');
  doc.setTextColor(...grayMd);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const now2 = new Date();
  doc.text(
    'JCE Transportes  ·  OS Nº ' + osNum + '  ·  Gerado em ' +
    fmtDate(now2.toISOString().split('T')[0]) + ' às ' +
    now2.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    W / 2, footerY + 6.2, { align: 'center' }
  );

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
