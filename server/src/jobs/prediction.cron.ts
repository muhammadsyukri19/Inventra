import cron from 'node-cron';
import { RecommendationService } from '../modules/recommendation/recommendation.service';
import { logger } from '../utils/logger';

const recommendationService = new RecommendationService();

export const initCronJobs = () => {
  // Menjalankan cron job setiap jam 00:00 (Tengah malam)
  // Format: 'menit jam hari bulan hari-dalam-minggu'
  cron.schedule('0 0 * * *', async () => {
    logger.info('Cron Job: Executing nightly AI Predictive Analytics...');
    try {
      await recommendationService.generateRecommendations();
    } catch (error) {
      logger.error('Cron Job Failed:', error);
    }
  });

  logger.info('Cron jobs initialized: Nightly AI Predictive Analytics scheduled.');
};
