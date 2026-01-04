import { Request, Response } from "express";
import User from "../models/User";
import { checkPassword, hashPassword } from "../helpers/bcrypt";
import { generateJWT } from "../helpers/jwt";

export const createUser = async (req: Request, res: Response) => {

    const { username, email, password } = req.body;

    const userExists = await User.findOne({ username });

    if (userExists) {
        const error = new Error("Un usuario con ese nombre ya esta registrado.");
        return res.status(409).json({error: error.message});
    }

    try {
        const user = new User();
        user.username = username;
        user.email = email;
        user.password = await hashPassword(password);
        user.isActive = true;
        await user.save();

        res.status(201).send('Registro creado correctamente.');
    } catch (error) {
        return res.status(500).json({ error: "Hubo un error" });
    }
}

export const loginUser = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    
    if (!user) {
        const error = new Error("El usuario no existe.");
        return res.status(409).json({error: error.message});
    }

    // Comprobar el password
    const isPasswordCorrect = await checkPassword(password, user.password)

    if (!isPasswordCorrect) {
        const error = new Error("Password Incorrecto.");
        return res.status(401).json({error: error.message});
    } 
    
    const token = generateJWT({id: user._id});

    res.send(token)
}

export const updatedUser = async (req: Request, res: Response) => {

    const { username, email, isActive } = req.body;
    const { userId } = req.params

    const userExist = await User.findOne({ username: username, _id: { $ne: userId }  });

    if (userExist) {
        const error = new Error("Un usuario con ese nombre ya esta registrado.");
        return res.status(409).json({error: error.message});
    }

    const user = await User.findById(userId);

    try {
        user.username = username;
        user.email = email;
        user.isActive = isActive;
        await user.save();

        res.status(201).send('Registro actualizado correctamente.');
    } catch (error) {
        return res.status(500).json({ error: "Hubo un error" });
    }
}

export const getAllUser = async (req: Request, res: Response) => {

    const page = req.query && req.query.page ? parseInt(req.query.page as string ) : 1;
    const limit = req.query && req.query.limit ? parseInt(req.query.limit as string ) : 10;

    const { search } = req.query;

    const options = {
      page,
      limit,
      sort: { createdAt: -1 } // opcional
    };

    const query: any = {}

    if (search) {
        query.$or = [
            { username: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
        ]
    }

    const result = await User.paginate(query, {
        ...options,
        select: "-password"
    });

    res.json({
      data: result.docs,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage
    });
}

export const getUserById = async (req: Request, res: Response) => {
    const { userId } = req.params

    const user = await User.findById(userId).select("-password -__v");

    return res.json(user)
}

export const getUser = async (req: Request, res: Response) => {
    return res.json(req.user)
}


export const deleteUserId = async (req: Request, res: Response) => {
    const { userId } = req.params

    try {
        // Primero obtener el usuario para conocer su estado actual
        const user = await User.findById(userId)

        if (!user) {
            return res.status(404).json({ 
                error: 'Usuario no encontrado' 
            })
        }

        // Actualizar el estado isActive
        const userUpdated = await User.findByIdAndUpdate(
            userId, 
            { isActive: !user.isActive },
            { new: true } // Retorna el documento actualizado
        ).select('-password -__v') // Excluir la contraseña

        return res.json({
            mensaje: 'Estado del usuario actualizado',
            usuario: userUpdated
        })
    } catch (error) {
        return res.status(500).json({ 
            error: 'Error al actualizar usuario' 
        })
    }

}

export const changePassword = async (req: Request, res: Response) => {

    const { old_password, password } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
        const error = new Error("Un usuario no existe.");
        return res.status(409).json({error: error.message});
    }

    const passwordCorrect = await checkPassword(old_password, user.password);

    if (!passwordCorrect) {
        const error = new Error("La contraseña actual es incorrecta");
        return res.status(409).json({error: error.message});
    }

    try {
        user.password = await hashPassword(password);
        await user.save();

        res.status(201).send('Contraseña actualizada correctamente.');
    } catch (error) {
        return res.status(500).json({ error: "Hubo un error" });
    }
}