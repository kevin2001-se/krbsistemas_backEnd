import express from 'express'
import cors from "cors";
import 'dotenv/config';
import { corsConfig } from './config/cors';
import { connectDB } from './config/db';
import appRouter from './router';
const app = express();

// Conectar con la base de datos
connectDB();

// Configurar cors
app.use(cors(corsConfig))

// Leer datos de formularios
app.use(express.json())

app.use('/api', appRouter)

export default app;