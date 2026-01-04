import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import { Types } from 'mongoose';

// Sobrescribir el tipo Request global
declare global {
    namespace Express {
        interface Request {
            user?: IUser
            user_id: Types.ObjectId;
        }
    }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {

    const bearer = req.headers.authorization;

    if (!bearer) {
        const error = new Error("No Autorizado");
        return res.status(401).json({error: error.message})
    }

    const [, token] = bearer.split(' ');

    if (!token) {
        const error = new Error("No Autorizado");
        return res.status(401).json({error: error.message})
    }

    try {
        const result = jwt.verify(token, process.env.JWT_SECRET);

         if (typeof result === 'object' && result.id) {
            const user = await User.findById(result.id).select('-password');
            if (!user) {
                const error = new Error("El Usuario no existe");
                return res.status(404).json({error: error.message})
            }
            req.user = user;
            req.user_id = user._id;
            next();
         }
    } catch (error) {
        res.status(500).json({error: 'Token no valido'})
    }
}