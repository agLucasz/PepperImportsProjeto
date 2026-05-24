import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { VendaDTO } from '../Services/vendaService';
import type { ContaAPagarDTO } from '../Services/contaAPagarService';

const fmtBRL = (v: number) =>
  v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const fmtDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString('pt-BR') : '—';

const fmtPeriod = (ini: string, fim: string) => {
  const d = (s: string) => new Date(s).toLocaleDateString('pt-BR');
  if (!ini && !fim) return 'Todo o período';
  if (!ini) return `Até ${d(fim)}`;
  if (!fim) return `A partir de ${d(ini)}`;
  return `${d(ini)} a ${d(fim)}`;
};

/* ── helpers de estilo ───────────────────────────────────────────────────── */
const PEPPER_RED: [number, number, number] = [225, 20, 10];
const BG_DARK: [number, number, number]    = [20, 20, 20];
const FG_LIGHT: [number, number, number]   = [245, 245, 245];
const FG_MUTE: [number, number, number]    = [138, 138, 138];
const GREEN: [number, number, number]      = [34, 197, 94];

function fillPageBg(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFillColor(...BG_DARK);
  doc.rect(0, 0, W, H, 'F');
}

function addHeader(doc: jsPDF, titulo: string, periodo: string) {
  const W = doc.internal.pageSize.getWidth();

  // fundo escuro — página inteira primeiro
  fillPageBg(doc);

  // faixa de cabeçalho ligeiramente mais escura
  doc.setFillColor(14, 14, 14);
  doc.rect(0, 0, W, 36, 'F');

  // faixa vermelha lateral
  doc.setFillColor(...PEPPER_RED);
  doc.rect(0, 0, 4, 36, 'F');

  // título
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...FG_LIGHT);
  doc.text('PEPPER IMPORTS', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...FG_MUTE);
  doc.text(titulo.toUpperCase(), 14, 22);
  doc.text(`Período: ${periodo}`, 14, 29);

  // data de geração (direita)
  doc.setFontSize(8);
  doc.text(
    `Gerado em ${new Date().toLocaleString('pt-BR')}`,
    W - 14,
    29,
    { align: 'right' },
  );
}

function addSummaryBox(
  doc: jsPDF,
  y: number,
  itens: { label: string; value: string; color?: [number, number, number] }[],
): number {
  const W = doc.internal.pageSize.getWidth();
  const colW = (W - 28) / itens.length;

  doc.setFillColor(26, 26, 26);
  doc.roundedRect(14, y, W - 28, 28, 4, 4, 'F');

  itens.forEach((item, i) => {
    const x = 14 + i * colW + colW / 2;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...FG_MUTE);
    doc.text(item.label.toUpperCase(), x, y + 9, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...(item.color ?? FG_LIGHT));
    doc.text(item.value, x, y + 22, { align: 'center' });
  });

  return y + 36;
}

function addFooter(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const pages = (doc.internal as any).getNumberOfPages();

  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setDrawColor(38, 38, 38);
    doc.line(14, H - 14, W - 14, H - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...FG_MUTE);
    doc.text('Pepper Imports — Relatório interno', 14, H - 7);
    doc.text(`Pág. ${i} de ${pages}`, W - 14, H - 7, { align: 'right' });
  }
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  RELATÓRIO DE VENDAS                                                       */
/* ══════════════════════════════════════════════════════════════════════════ */
export function gerarPDFVendas(
  vendas: VendaDTO[],
  dataInicio: string,
  dataFim: string,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const periodo = fmtPeriod(dataInicio, dataFim);

  addHeader(doc, 'Relatório de Vendas', periodo);

  const totalFaturado     = vendas.reduce((a, v) => a + v.valorVenda, 0);
  const ticketMedio       = vendas.length ? totalFaturado / vendas.length : 0;
  const totalItens        = vendas.reduce((a, v) => a + v.itens.reduce((s, i) => s + i.quantidadeItem, 0), 0);

  const yAfterSummary = addSummaryBox(doc, 44, [
    { label: 'Total de vendas',    value: String(vendas.length) },
    { label: 'Faturamento total',  value: fmtBRL(totalFaturado), color: GREEN },
    { label: 'Ticket médio',       value: fmtBRL(ticketMedio) },
    { label: 'Itens vendidos',     value: String(totalItens) },
  ]);

  autoTable(doc, {
    startY: yAfterSummary,
    didDrawPage: () => fillPageBg(doc),
    head: [['#', 'Produtos', 'Itens', 'Total', 'Data']],
    body: vendas.map(v => [
      `#${v.vendaId}`,
      v.itens.map(i => `${i.nomeProduto} ×${i.quantidadeItem}`).join(', '),
      String(v.itens.reduce((s, i) => s + i.quantidadeItem, 0)),
      fmtBRL(v.valorVenda),
      fmtDate(v.dataVenda),
    ]),
    foot: [['', '', '', fmtBRL(totalFaturado), '']],
    showFoot: 'lastPage',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 5,
      fillColor: [20, 20, 20] as [number, number, number],
      textColor: [245, 245, 245] as [number, number, number],
      lineColor: [38, 38, 38] as [number, number, number],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BG_DARK,
      textColor: FG_MUTE,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    footStyles: {
      fillColor: [26, 26, 26] as [number, number, number],
      textColor: GREEN,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [22, 22, 22] as [number, number, number],
    },
    columnStyles: {
      0: { cellWidth: 14, textColor: FG_MUTE },
      2: { cellWidth: 14, halign: 'center' },
      3: { cellWidth: 30, halign: 'right', fontStyle: 'bold', textColor: FG_LIGHT },
      4: { cellWidth: 28, textColor: FG_MUTE },
    },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`vendas_${dataInicio || 'all'}_${dataFim || 'all'}.pdf`);
}

/* ══════════════════════════════════════════════════════════════════════════ */
/*  RELATÓRIO DE CONTAS A PAGAR                                               */
/* ══════════════════════════════════════════════════════════════════════════ */
export function gerarPDFContas(
  contas: ContaAPagarDTO[],
  dataInicio: string,
  dataFim: string,
) {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const periodo = fmtPeriod(dataInicio, dataFim);

  addHeader(doc, 'Relatório de Contas a Pagar', periodo);

  const totalEmAberto = contas.filter(c => !c.pago).reduce((a, c) => a + c.valorParcela, 0);
  const totalPago     = contas.filter(c =>  c.pago).reduce((a, c) => a + c.valorParcela, 0);
  const totalGeral    = totalEmAberto + totalPago;

  const yAfterSummary = addSummaryBox(doc, 44, [
    { label: 'Parcelas',      value: String(contas.length) },
    { label: 'Em aberto',     value: fmtBRL(totalEmAberto), color: PEPPER_RED },
    { label: 'Total pago',    value: fmtBRL(totalPago),     color: GREEN },
    { label: 'Total período', value: fmtBRL(totalGeral) },
  ]);

  autoTable(doc, {
    startY: yAfterSummary,
    didDrawPage: () => fillPageBg(doc),
    head: [['Despesa', 'Parcela', 'Vencimento', 'Pagamento', 'Valor', 'Status']],
    body: contas.map(c => [
      c.nomeDespesa,
      `${c.numeroParcela}/${c.totalParcelas}`,
      fmtDate(c.dataVencimento),
      c.dataPagamento ? fmtDate(c.dataPagamento) : '—',
      fmtBRL(c.valorParcela),
      c.pago ? 'Pago' : 'Em aberto',
    ]),
    foot: [['', '', '', 'Total', fmtBRL(totalGeral), '']],
    showFoot: 'lastPage',
    styles: {
      font: 'helvetica',
      fontSize: 8.5,
      cellPadding: 5,
      fillColor: [20, 20, 20] as [number, number, number],
      textColor: [245, 245, 245] as [number, number, number],
      lineColor: [38, 38, 38] as [number, number, number],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: BG_DARK,
      textColor: FG_MUTE,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    footStyles: {
      fillColor: [26, 26, 26] as [number, number, number],
      textColor: FG_LIGHT,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [22, 22, 22] as [number, number, number],
    },
    columnStyles: {
      1: { cellWidth: 18, halign: 'center', textColor: FG_MUTE },
      2: { cellWidth: 26, textColor: FG_MUTE },
      3: { cellWidth: 26, textColor: FG_MUTE },
      4: { cellWidth: 30, halign: 'right', fontStyle: 'bold' },
      5: {
        cellWidth: 22,
        halign: 'center',
      },
    },
    didParseCell(data) {
      if (data.column.index === 5 && data.section === 'body') {
        const val = data.cell.raw as string;
        data.cell.styles.textColor = val === 'Pago' ? GREEN : PEPPER_RED;
        data.cell.styles.fontStyle = 'bold';
      }
    },
    margin: { left: 14, right: 14 },
  });

  addFooter(doc);
  doc.save(`contas_a_pagar_${dataInicio || 'all'}_${dataFim || 'all'}.pdf`);
}
