import { prisma } from '../../config/database';

export class DashboardService {
  async getSummary() {
    console.log("Menghitung Ringkasan Dashboard...");

    // 1. Total Produk (Semua yang ada di tabel products)
    const totalProducts = await prisma.product.count();

    // 2. Total Stok (Jumlah semua current_stock di tabel inventories)
    const inventorySum = await prisma.inventory.aggregate({
      _sum: { currentStock: true }
    });

    // 3. Produk Hampir Habis (Stok > 0 tapi <= reorderPoint)
    const lowStockCount = await prisma.inventory.count({
      where: {
        currentStock: {
          gt: 0,
          lte: 5 // Kita asumsikan 5 sebagai batas peringatan
        }
      }
    });

    // 4. Stok Habis (Stok benar-benar 0)
    const outOfStockCount = await prisma.inventory.count({
      where: { currentStock: 0 }
    });

    // 5. Total Transaksi (Semua riwayat masuk dan keluar)
    const totalTransactions = await prisma.transaction.count();

    // 6. Penjualan (Hanya transaksi tipe OUT)
    const totalSales = await prisma.transaction.count({
      where: { type: 'OUT' }
    });

    console.log(`Hasil: Produk(${totalProducts}), Stok(${inventorySum._sum.currentStock})`);

    return {
      totalProducts: totalProducts || 0,
      totalStock: inventorySum._sum.currentStock || 0,
      lowStockCount: lowStockCount || 0,
      outOfStockCount: outOfStockCount || 0,
      monthlySalesCount: totalSales || 0,
      totalTransactions: totalTransactions || 0
    };
  }
}

export const dashboardService = new DashboardService();