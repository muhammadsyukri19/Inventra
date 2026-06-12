import { Request, Response } from 'express';
import { RecommendationService } from './recommendation.service';
import { sendSuccess, sendError } from '../../utils/response';

const recommendationService = new RecommendationService();

export class RecommendationController {
  
  // Ambil semua rekomendasi pending
  getPendingRecommendations = async (req: Request, res: Response) => {
    try {
      const recommendations = await recommendationService.getRecommendations();
      return sendSuccess(res, recommendations, 200);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  };

  // Endpoint untuk trigger perhitungan manual (Opsional, untuk testing/demo)
  triggerPrediction = async (req: Request, res: Response) => {
    try {
      const result = await recommendationService.generateRecommendations();
      return sendSuccess(res, result, 200);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  };

  // Update status rekomendasi (Approve/Reject)
  updateStatus = async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const status = req.body.status as any;
      const result = await recommendationService.updateRecommendationStatus(id, status);
      return sendSuccess(res, result, 200);
    } catch (error: any) {
      return sendError(res, error.message, 500);
    }
  };
}
