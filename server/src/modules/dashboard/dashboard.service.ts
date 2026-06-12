import { prisma } from '../../config/database';

export class DashboardService {
  /**
   * Mengambil ringkasan angka untuk kartu dashboard
   */
  async getSummary() {
    const totalProducts = await prisma.product.count();
    
    const inventorySum = await prisma.inventory.aggregate({
      _sum: { currentStock: true }
    });

    const lowStockCount = await prisma.inventory.count({
      where: {
        currentStock: { gt: 0, lte: 5 }
      }
    });

    const outOfStockCount = await prisma.inventory.count({
      where: { currentStock: 0 }
    });

    const totalTransactions = await prisma.transaction.count();

    const totalSales = await prisma.transaction.count({
      where: { type: 'OUT' }
    });

    // Ambil data untuk grafik (Panggil fungsi baru di bawah)
    const chartData = await this.getChartData();

    return {
      totalProducts: totalProducts || 0,
      totalStock: inventorySum._sum.currentStock || 0,
      lowStockCount: lowStockCount || 0,
      outOfStockCount: outOfStockCount || 0,
      monthlySalesCount: totalSales || 0,
      totalTransactions: totalTransactions || 0,
      chartData // Masukkan data grafik ke dalam balasan API
    };
  }

  /**
   * Fungsi baru untuk mengambil tren transaksi 7 hari terakhir
   */
  async getChartData() {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // 1. Ambil semua transaksi dalam 7 hari terakhir
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        type: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // 2. Kelompokkan data berdasarkan tanggal
    // Hasilnya nanti seperti: { '2023-10-01': { date: '01/10', masuk: 5, keluar: 2 } }
    const grouped = transactions.reduce((acc: any, curr) => {
      // Format tanggal jadi DD/MM (misal: 11/06)
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

    // 3. Ubah objek menjadi array agar bisa dibaca library grafik
    return Object.values(grouped);
  }
}

export const dashboardService = new DashboardService();