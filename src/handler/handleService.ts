import { Request, Response } from "express";
import Service from "../models/Service";
import formidable from "formidable";
import cloudinary from "../config/cloudinary";
import { v4 as uuid } from 'uuid';

export const getService = async (req: Request, res: Response) => {
    const services = await Service.find({});

    return res.json(services)
}

export const getServicePaginate = async (req: Request, res: Response) => {

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
            { description: { $regex: search, $options: "i" } },
            { title: { $regex: search, $options: "i" } },
            ...(isNaN(Number(search)) ? [] : [{ price: Number(search) }]),
        ]
    }

    const result = await Service.paginate(query, options);

    res.json({
      data: result.docs,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage
    });
}

export const createService = async (req: Request, res: Response) => {

    const form = formidable({
        multiples: false,
    }); // Configurar el soporte

    
    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                return res.status(400).json({ error: "Error al procesar el formulario" });
            }

            const { title, description, price } = fields;
            const file = files.image?.[0]; // nombre del input

            if (!file) {
                return res.status(400).json({ error: "La imagen es obligatoria" });
            }

            // ⬆️ Subir imagen a Cloudinary
            const result = await cloudinary.uploader.upload(file.filepath, {
                folder: "services",
                public_id: uuid(),
            });

            const service = new Service();
            service.title = String(title);
            service.description = String(description);
            service.price = Number(price);
            service.image = result.secure_url; // URL Cloudinary
            if (!service.user_id) {
                service.user_id = req.user_id
            }

            await service.save();

            return res.send("Servicio registrado correctamente")

        } catch (error) {
            return res.status(500).json({ error: "Hubo un error" });
        }
    });
}

export const getServiceById = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;

        const service = await Service.findById(id).select('_id title description price image');

        if (!service) {
            const error = new Error("Servicio no encontrado")
            return res.status(404).json({ error: error.message});
        }

        return res.json(service)
    } catch (e) {
        const error = new Error("Hubo un error")
        return res.status(500).json({error: error.message});
    }    
}

export const updateService = async (req: Request, res: Response) => {

    const form = formidable({
        multiples: false
    });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                return res.status(400).json({ error: "Error al procesar el formulario" });
            }

            const { id } = req.params;
            const { title, description, price } = fields;
            const file = files.image?.[0];

            const service = await Service.findById(id);

            if (!service) {
                return res.status(404).json({ error: "Servicio no encontrado" });
            }

            // Si viene nueva imagen → borrar la anterior en Cloudinary
            if (file && service.image) {
                const publicId = service.image
                .split("/")
                .slice(-2)
                .join("/")
                .split(".")[0];

                await cloudinary.uploader.destroy(publicId);
            }

            // ⬆️ Subir nueva imagen si existe
            if (file) {
                const result = await cloudinary.uploader.upload(file.filepath, {
                folder: "services",
                public_id: uuid(),
                });

                service.image = result.secure_url;
            }

            // ✏️ Actualizar campos
            service.title = String(title);
            service.description = String(description);
            service.price = Number(price);

            await service.save();

            return res.send("Servicio actualizado correctamente")

        } catch (error) {
            return res.status(500).json({ error: "Hubo un error al actualizar el service" });
        }
    });
}

export const deleteService = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const serviceEliminado = await Service.findByIdAndDelete(id);

    if (!serviceEliminado) {
      return res.status(404).json({
        error: "Servicio no encontrado"
      });
    }

    // Si viene nueva imagen → borrar la anterior en Cloudinary
    if (serviceEliminado.image) {
        const publicId = serviceEliminado.image
        .split("/")
        .slice(-2)
        .join("/")
        .split(".")[0];

        await cloudinary.uploader.destroy(publicId);
    }

    return res.send("Servicio eliminado correctamente")
  } catch (e) {
    return res.status(500).json({
      error: "Error al eliminar el producto",
    });
  }
};