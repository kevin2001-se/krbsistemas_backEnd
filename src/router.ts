
import express from "express";
import routerBanner from "./routes/banner.route";
import routerProducto from "./routes/producto.route";
import routerService from "./routes/service.route";
import routerUser from "./routes/user.route";

const appRouter = express();

appRouter.use('/banner', routerBanner)
appRouter.use('/producto', routerProducto)
appRouter.use('/service', routerService)
appRouter.use('/user', routerUser)

export default appRouter;