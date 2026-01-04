import { Router } from 'express'
import { authenticate } from '../middleware/auth';
import { createProducto, deleteProducto, getProductoById, getProductos, getProductosPaginate, updateProducto } from '../handler/handleProducto';

const routerProducto = Router();

routerProducto.get('/', getProductos);

routerProducto.get('/paginate',authenticate, getProductosPaginate);

routerProducto.post("/",authenticate,  createProducto);

routerProducto.get('/:id',authenticate,  getProductoById);

routerProducto.put("/:id",authenticate, updateProducto);

routerProducto.delete("/:id",authenticate, deleteProducto);

export default routerProducto;