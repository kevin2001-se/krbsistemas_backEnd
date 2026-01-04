import { Router } from 'express'
import { createService, deleteService, getService, getServiceById, getServicePaginate, updateService } from '../handler/handleService';
import { authenticate } from '../middleware/auth';

const routerService = Router();

routerService.get('/', getService);

routerService.get('/paginate', getServicePaginate);

routerService.post("/",authenticate,  createService);

routerService.get('/:id',authenticate,  getServiceById);

routerService.put("/:id",authenticate,  updateService);

routerService.delete("/:id",authenticate,  deleteService);

export default routerService;