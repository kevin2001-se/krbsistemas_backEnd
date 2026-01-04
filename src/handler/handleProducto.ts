import { Request, Response } from "express";
import Producto from "../models/Producto";
import formidable from "formidable";
import cloudinary from "../config/cloudinary";
import { v4 as uuid } from 'uuid';

export const getProductos = async (req: Request, res: Response) => {
    const productos = await Producto.find({});

    return res.json(productos)
}

export const getProductosPaginate = async (req: Request, res: Response) => {

    const page = req.query && req.query.page ? parseInt(req.query.page as string ) : 1;
    const limit = req.query && req.query.limit ? parseInt(req.query.limit as string ) : 10;

    const { search } = req.query;

    const query: any = {}

    if (search) {
        query.$or = [
            { description: { $regex: search, $options: "i" } },
            ...(isNaN(Number(search)) ? [] : [{ price: Number(search) }]),
            ...(isNaN(Number(search)) ? [] : [{ stock: Number(search) }])
        ]
    }

    const options = {
        query,
        page,
        limit,
        sort: { createdAt: -1 } // opcional
    };

    const result = await Producto.paginate(options)

    res.json({
      data: result.docs,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage
    });
}


export const createProducto = async (req: Request, res: Response) => {

    const form = formidable({
        multiples: false,
    }); // Configurar el soporte

    
    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                return res.status(400).json({ error: "Error al procesar el formulario" });
            }

            const { description, price, stock } = fields;

            const file = files.image?.[0]; // nombre del input

            if (!file) {
                return res.status(400).json({ error: "La imagen es obligatoria" });
            }
            
            //  Subir imagen a Cloudinary
            const result = await cloudinary.uploader.upload(file.filepath, {
                folder: "productos",
                public_id: uuid(),
            });

            const producto = new Producto();
            producto.description = String(description);
            producto.price = Number(price);
            producto.stock = stock ? Number(stock) : 0;
            producto.image = result.secure_url; // URL Cloudinary
            producto.user_id = req.user_id

            await producto.save();

            return res.send("Producto registrado correctamente")

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: "Hubo un error" });
        }
    });
}

export const getProductoById = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;

        const producto = await Producto.findById(id).select('_id description price image');

        if (!producto) {
            const error = new Error("Producto no encontrado")
            return res.status(404).json({ error: error.message});
        }

        return res.json(producto)
    } catch (e) {
        const error = new Error("Hubo un error")
        return res.status(500).json({error: error.message});
    }    
}

export const updateProducto = async (req: Request, res: Response) => {

    const form = formidable({
        multiples: false
    });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                return res.status(400).json({ error: "Error al procesar el formulario" });
            }

            const { id } = req.params;
            const { description, price, stock } = fields;
            const file = files.image?.[0];

            const producto = await Producto.findById(id);

            if (!producto) {
                return res.status(404).json({ error: "Producto no encontrado" });
            }

            // Si viene nueva imagen → borrar la anterior en Cloudinary
            if (file && producto.image) {
                const publicId = producto.image
                .split("/")
                .slice(-2)
                .join("/")
                .split(".")[0];

                await cloudinary.uploader.destroy(publicId);
            }

            // ⬆️ Subir nueva imagen si existe
            if (file) {
                const result = await cloudinary.uploader.upload(file.filepath, {
                folder: "banners",
                public_id: uuid(),
                });

                producto.image = result.secure_url;
            }

            // ✏️ Actualizar campos
            producto.description = String(description);
            producto.price = Number(price);
            producto.stock = Number(stock);
            if (!producto.user_id) {
                producto.user_id = req.user_id
            }

            await producto.save();

            return res.send("Producto actualizado correctamente")

        } catch (error) {
            console.log(error)
            return res.status(500).json({ error: "Hubo un error al actualizar el producto" });
        }
    });
}

export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const productoEliminado = await Producto.findByIdAndDelete(id);

    if (!productoEliminado) {
      return res.status(404).json({
        error: "Producto no encontrado"
      });
    }

    // Si viene nueva imagen → borrar la anterior en Cloudinary
    if (productoEliminado.image) {
        const publicId = productoEliminado.image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
    }

    return res.send("Producto eliminado correctamente")
  } catch (e) {
    return res.status(500).json({
      error: "Error al eliminar el producto",
    });
  }
};