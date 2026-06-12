import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportDashboardPDF = (summary: any) => {
  if (!summary) return;
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString('id-ID');

  doc.setFontSize(18);
  doc.text('LAPORAN INVENTARIS - INVENTRA', 14, 20);
  doc.setFontSize(10);
  doc.text(`Tanggal Cetak: ${date}`, 14, 28);

  autoTable(doc, {
    startY: 35,
    head: [['Kategori Ringkasan', 'Jumlah']],
    body: [
      ['Total Produk Terdaftar', `${summary.totalProducts} Item`],
      ['Total Stok Tersedia', `${summary.totalStock} Pcs`],
      ['Produk Hampir Habis', `${summary.lowStockCount} Item`],
      ['Produk Stok Habis', `${summary.outOfStockCount} Item`],
      ['Total Transaksi', `${summary.totalTransactions} Kali`],
    ],
    headStyles: { fillColor: [79, 70, 229] },
  });

  if (summary.topProducts && summary.topProducts.length > 0) {
    doc.text('Daftar Produk Terlaris:', 14, (doc as any).lastAutoTable.finalY + 15);
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Peringkat', 'Nama Produk', 'Total Terjual']],
      body: summary.topProducts.map((p: any, i: number) => [`#${i + 1}`, p.name, `${p.totalSold} Terjual`]),
      headStyles: { fillColor: [16, 185, 129] },
    });
  }

  doc.save(`Laporan_Inventra_${date.replace(/\//g, '-')}.pdf`);
};