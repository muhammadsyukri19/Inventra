import { prisma } from '../../config/database';

export class DashboardService {
  /**
   * Mengambil ringkasan lengkap untuk Dashboard
   */
  async getSummary() {
    // 1. Ambil data angka dasar
    const totalProducts = await prisma.product.count();
    
    const inventorySum = await prisma.inventory.aggregate({
      _sum: { currentStock: true }
    });

    const lowStockCount = await prisma.inventory.count({
      where: {
        currentStock: { gt: 0, lte: 5 } // Ambang batas stok tipis
      }
    });

    const outOfStockCount = await prisma.inventory.count({
      where: { currentStock: 0 }
    });

    const totalTransactions = await prisma.transaction.count();

    const totalSales = await prisma.transaction.count({
      where: { type: 'OUT' }
    });

    // 2. Ambil data Tren Grafik (7 hari terakhir)
    const chartData = await this.getChartData();

    // 3. Ambil data Rekomendasi Restock (DSS Logic sederhana)
    // Mencari produk yang stoknya <= 10 untuk segera dipesan kembali
    const recommendations = await prisma.inventory.findMany({
      where: {
        currentStock: { lte: 10 } 
      },
      include: {
        product: {
          select: { name: true, unit: true, sku: true }
        }
      },
      take: 5,
      orderBy: { currentStock: 'asc' }
    });

    // 4. Ambil data Produk Terlaris (Berdasarkan jumlah item keluar)
    const topProductsRaw = await prisma.transactionItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: {
        _sum: { quantity: 'desc' }
      },
      take: 5
    });

    // Ambil detail nama produk untuk Top Products
    const topProducts = await Promise.all(
      topProductsRaw.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { name: true }
        });
        return {
          name: product?.name || 'Produk Tidak Dikenal',
          totalSold: item._sum.quantity || 0
        };
      })
    );

    return {
      totalProducts: totalProducts || 0,
      totalStock: inventorySum._sum.currentStock || 0,
      lowStockCount: lowStockCount || 0,
      outOfStockCount: outOfStockCount || 0,
      monthlySalesCount: totalSales || 0,
      totalTransactions: totalTransactions || 0,
      chartData,
      recommendations, // Tambahkan ini
      topProducts      // Tambahkan ini
    };
  }

  /**
   * Fungsi mengambil tren transaksi 7 hari terakhir
   */
  async getChartData() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const transactions = await prisma.transaction.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
      select: { createdAt: true, type: true },
      orderBy: { createdAt: 'asc' },
    });

    const grouped = transactions.reduce((acc: any, curr) => {
      const day = curr.createdAt.getDate().toString().padStart(2, '0');
      const month = (curr.createdAt.getMonth() + 1).toString().padStart(2, '0');
      const dateKey = `${day}/${month}`;

      if (!acc[dateKey]) {
        acc[dateKey] = { name: dateKey, masuk: 0, keluar: 0 };
      }

      if (curr.type === 'IN') {
        acc[dateKey].masuk += 1;
      } else {
        acc[dateKey].keluar += 1;
      }

      return acc;
    }, {});

    return Object.values(grouped);
  }
}

export const dashboardService = new DashboardService();