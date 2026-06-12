import { PrismaClient, RecommendationPriority, RecommendationStatus } from '@prisma/client';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

export class RecommendationService {
  /**
   * Menghasilkan rekomendasi restock untuk semua produk
   * berdasarkan rata-rata penjualan (Moving Average 30 Hari).
   */
  async generateRecommendations() {
    try {
      logger.info('Starting AI Predictive Analytics for Restock Recommendations...');
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // Ambil semua produk beserta inventory dan pergerakan stok (barang keluar) 30 hari terakhir
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: {
          inventory: true,
          stockMovements: {
            where: {
              movementType: 'OUT',
              createdAt: {
                gte: thirtyDaysAgo,
              },
            },
          },
        },
      });

      let generatedCount = 0;

      for (const product of products) {
        if (!product.inventory) continue;

        const inventory = product.inventory;
        
        // 1. Hitung Total Terjual 30 hari terakhir
        const totalSold = product.stockMovements.reduce((sum, movement) => sum + movement.quantity, 0);
        
        // 2. Hitung Rata-rata Penjualan Harian (Moving Average)
        const averageDailySales = Number((totalSold / 30).toFixed(2));
        
        // Jika tidak ada penjualan, lewati
        if (averageDailySales <= 0 && inventory.currentStock > inventory.minStock) {
          continue;
        }

        // 3. Kalkulasi Parameter Restock
        const leadTimeDays = inventory.leadTimeDays || 7;
        
        // Safety Stock: Cadangan jika pengiriman telat (asumsi telat maksimal 3 hari atau 50% lead time)
        const safetyStock = inventory.safetyStock > 0 
          ? inventory.safetyStock 
          : Math.ceil(averageDailySales * (leadTimeDays * 0.5));
          
        // Reorder Point (ROP): Titik dimana barang harus dipesan lagi
        // ROP = (Average Daily Sales * Lead Time) + Safety Stock
        const reorderPoint = inventory.reorderPoint > 0 
          ? inventory.reorderPoint 
          : Math.ceil((averageDailySales * leadTimeDays) + safetyStock);

        // Jika stok saat ini <= Reorder Point, kita buatkan rekomendasi
        if (inventory.currentStock <= reorderPoint || inventory.currentStock <= inventory.minStock) {
          
          // Berapa banyak yang harus dipesan?
          // Idealnya sampai maxStock, tapi jika tidak diset, pesan untuk 30 hari ke depan
          let recommendedQuantity = 0;
          if (inventory.maxStock > 0 && inventory.maxStock > inventory.currentStock) {
            recommendedQuantity = inventory.maxStock - inventory.currentStock;
          } else {
            recommendedQuantity = Math.ceil(averageDailySales * 30);
          }
          
          // Pastikan pesanan minimal adalah 1
          if (recommendedQuantity <= 0) recommendedQuantity = 1;

          // Menentukan Prioritas berdasarkan seberapa cepat akan habis
          let priority: RecommendationPriority = RecommendationPriority.LOW;
          const daysUntilEmpty = averageDailySales > 0 ? inventory.currentStock / averageDailySales : 999;
          
          if (daysUntilEmpty <= leadTimeDays) {
            priority = RecommendationPriority.CRITICAL;
          } else if (daysUntilEmpty <= leadTimeDays + 3) {
            priority = RecommendationPriority.HIGH;
          } else if (daysUntilEmpty <= leadTimeDays + 7) {
            priority = RecommendationPriority.MEDIUM;
          }

          // Simpan atau update ke database — cari dulu apakah sudah ada rekomendasi PENDING
          const existingPending = await prisma.restockRecommendation.findFirst({
            where: {
              productId: product.id,
              status: RecommendationStatus.PENDING,
            },
          });

          if (existingPending) {
            await prisma.restockRecommendation.update({
              where: { id: existingPending.id },
              data: {
                currentStock: inventory.currentStock,
                reorderPoint,
                safetyStock,
                averageDailySales,
                recommendedQuantity,
                leadTimeDays,
                priority,
              },
            });
          } else {
            await prisma.restockRecommendation.create({
              data: {
                productId: product.id,
                currentStock: inventory.currentStock,
                reorderPoint,
                safetyStock,
                averageDailySales,
                recommendedQuantity,
                leadTimeDays,
                priority,
                status: RecommendationStatus.PENDING,
              },
            });
          }

          generatedCount++;
        }
      }

      logger.info(`Predictive Analytics completed. Generated ${generatedCount} recommendations.`);
      return { success: true, generatedCount };
      
    } catch (error) {
      logger.error('Error in generateRecommendations:', error);
      throw error;
    }
  }

  async getRecommendations(status?: RecommendationStatus) {
    return prisma.restockRecommendation.findMany({
      where: {
        status: status ?? RecommendationStatus.PENDING,
      },
      include: {
        product: {
          include: {
            category: true,
            supplier: true,
          }
        }
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async updateRecommendationStatus(id: string, status: RecommendationStatus) {
    return prisma.restockRecommendation.update({
      where: { id },
      data: { status },
      include: {
        product: {
          include: {
            category: true,
            supplier: true,
          }
        }
      }
    });
  }
}
