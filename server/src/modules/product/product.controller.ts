import type { Request, Response, NextFunction } from 'express';
import { productService } from './product.service';
import { sendSuccess } from '../../utils/response';
import { buildPaginationMeta } from '../../utils/pagination';

export class ProductController {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = (req.query.search as string);
      const categoryId = (req.query.categoryId as string);
      const supplierId = (req.query.supplierId as string);
      const isActive = req.query.isActive !== undefined ? req.query.isActive === 'true' : undefined;
      const stockStatus = req.query.stockStatus as 'low' | 'out' | 'safe' | undefined;

      const { total, data } = await productService.findAll({ 
        page, limit, search, categoryId, supplierId, isActive, stockStatus 
      });
      
      const meta = buildPaginationMeta(total, page, limit);

      sendSuccess(res, {
        data,
        meta,
        message: 'Berhasil mengambil data produk',
      });
    } catch (error) {
      next(error);
    }
  }

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.findById((req.params.id as string));
      sendSuccess(res, {
        data: product,
        message: 'Berhasil mengambil detail produk',
      });
    } catch (error) {
      next(error);
    }
  }

  async validateBySku(req: Request, res: Response, next: NextFunction) {
    try {
      const { code } = req.params;
      
      // Ambil data produk dari service
      const product = await productService.findBySku(code as string);
      
      // PERBAIKAN: Langsung kirim 'product', jangan dibungkus { data: product }
      // Supaya hasilnya tidak bertumpuk jadi response.data.data.data
      sendSuccess(res, product); 
      
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.create(req.body);
      sendSuccess(res, {
        data: product,
        message: 'Produk berhasil ditambahkan',
        statusCode: 201,
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const product = await productService.update((req.params.id as string), req.body);
      sendSuccess(res, {
        data: product,
        message: 'Data produk berhasil diupdate',
      });
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const isActive = req.body.isActive;
      const product = await productService.toggleActive((req.params.id as string), isActive);
      sendSuccess(res, {
        data: product,
        message: `Produk berhasil di${isActive ? 'aktifkan' : 'nonaktifkan'}`,
      });
    } catch (error) {
      next(error);
    }
  }

async delete(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    
    await productService.delete(id as string); 
    
    sendSuccess(res, {
      message: 'Produk berhasil dihapus selamanya'
    });
  } catch (error) {
    next(error);
  }
}
}

export const productController = new ProductController();
