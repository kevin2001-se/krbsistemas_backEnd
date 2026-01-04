import { Request, Response } from "express";
import Banner from "../models/Banner";
import formidable from "formidable";
import cloudinary from "../config/cloudinary";
import { v4 as uuid } from 'uuid';

export const getBanners = async (req: Request, res: Response) => {
    const banners = await Banner.find({});

    return res.json(banners)
}

export const getBannersPaginate = async (req: Request, res: Response) => {

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

    const result = await Banner.paginate(query, options);

    res.json({
      data: result.docs,
      totalDocs: result.totalDocs,
      totalPages: result.totalPages,
      page: result.page,
      hasNextPage: result.hasNextPage,
      hasPrevPage: result.hasPrevPage
    });
}

export const createBanner = async (req: Request, res: Response) => {

    const form = formidable({
        multiples: false,
    }); // Configurar el soporte

    
    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                return res.status(400).json({ error: "Error al procesar el formulario" });
            }

            const { title, description, price, background } = fields;
            const file = files.image?.[0]; // nombre del input

            if (!file) {
                return res.status(400).json({ error: "La imagen es obligatoria" });
            }

            // ⬆️ Subir imagen a Cloudinary
            const result = await cloudinary.uploader.upload(file.filepath, {
                folder: "banners",
                public_id: uuid(),
            });

            const banner = new Banner();
            banner.title = String(title);
            banner.description = String(description);
            banner.price = price ? Number(price) : null;
            banner.background = background ? String(background) : null;
            banner.image = result.secure_url; // URL Cloudinary
            banner.user_id = req.user_id

            await banner.save();

            return res.send("Banner registrado correctamente")

        } catch (error) {
            return res.status(500).json({ error: "Hubo un error" });
        }
    });
}

export const getBannerById = async (req: Request, res: Response) => {
    try {
        
        const { id } = req.params;

        const banner = await Banner.findById(id).select('_id title description price background image');

        if (!banner) {
            const error = new Error("Banner no encontrado")
            return res.status(404).json({ error: error.message});
        }

        return res.json(banner)
    } catch (e) {
        const error = new Error("Hubo un error")
        return res.status(500).json({error: error.message});
    }    
}

export const updateBanner = async (req: Request, res: Response) => {

    const form = formidable({
        multiples: false
    });

    form.parse(req, async (err, fields, files) => {
        try {
            if (err) {
                return res.status(400).json({ error: "Error al procesar el formulario" });
            }

            const { id } = req.params;
            const { title, description, price, background } = fields;
            const file = files.image?.[0];

            const banner = await Banner.findById(id);

            if (!banner) {
                return res.status(404).json({ error: "Banner no encontrado" });
            }

            // Si viene nueva imagen → borrar la anterior en Cloudinary
            if (file && banner.image) {
                const publicId = banner.image
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

                banner.image = result.secure_url;
            }

            // ✏️ Actualizar campos
            banner.title = String(title);
            banner.description = String(description);
            banner.price = price ? Number(price) : null;
            banner.background = background ? String(background) : null;
            if (!banner.user_id) {
                banner.user_id = req.user_id
            }

            await banner.save();

            return res.send("Banner actualizado correctamente")

        } catch (error) {

            console.log(error)
            return res.status(500).json({ error: "Hubo un error al actualizar el banner" });
        }
    });
}