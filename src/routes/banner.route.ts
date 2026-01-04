import { Router } from 'express'
import { createBanner, getBannerById, getBanners, getBannersPaginate, updateBanner } from '../handler/handleBanner';
import { authenticate } from '../middleware/auth';

const routerBanner = Router();

routerBanner.get('/', getBanners);

routerBanner.get('/paginate', getBannersPaginate);

routerBanner.post("/",authenticate, createBanner);

routerBanner.get('/:id',authenticate,  getBannerById);

routerBanner.put("/:id",authenticate, updateBanner);

export default routerBanner;