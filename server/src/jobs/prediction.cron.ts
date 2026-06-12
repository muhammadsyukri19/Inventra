import cron from 'node-cron';
import { RecommendationService } from '../modules/recommendation/recommendation.service';
import { logger } from '../utils/logger';

const recommendationService = new RecommendationService();

export const initCronJobs = () => {
  // Menjalankan cron job setiap jam 02:00 WIB (Asia/Jakarta)
  cron.schedule('0 2 * * *', async () => {
    logger.info('Cron Job: Executing nightly AI Predictive Analytics...');
    try {
      await recommendationService.generateRecommendations();
    } catch (error) {
      logger.error('Cron Job Failed:', error);
    }
  }, {
    timezone: 'Asia/Jakarta',
  });

  logger.info('Cron jobs initialized: Nightly AI Predictive Analytics scheduled.');
};
