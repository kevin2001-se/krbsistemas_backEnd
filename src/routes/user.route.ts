import { Router } from 'express'
import { getAllUser, createUser, getUserById, updatedUser, loginUser, deleteUserId, getUser, changePassword } from '../handler/handleUser';
import { authenticate } from '../middleware/auth';

const routerUser = Router();

routerUser.get('/', 
    authenticate,
    getAllUser);

routerUser.post("/", 
    authenticate,
    createUser);

routerUser.get('/auth',
    authenticate, 
    getUser);

routerUser.get('/:userId',
    authenticate, 
    getUserById);

routerUser.put("/changePassword", 
    authenticate,
    changePassword);

routerUser.put("/:userId", 
    authenticate,
    updatedUser);

routerUser.delete("/:userId", 
    authenticate,
    deleteUserId);

routerUser.post("/login", loginUser);

export default routerUser;