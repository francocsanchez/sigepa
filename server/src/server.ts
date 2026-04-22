import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Connect to MongoDB
import { connectDB } from "./config/mongo";
import { corsOptions } from "./config/cors";

dotenv.config();
connectDB();

const app = express();

app.use(morgan("dev"));

// Middlewares
app.use(cors(corsOptions));
app.use(express.json());

// Routes
import usuarioRoutes from "./routes/usuarioRoutes";
import configRoutes from "./routes/configRoutes";
import categoriaContableRoutes from "./routes/categoriaContableRoutes";
import movimientoContableRoutes from "./routes/movimientoContableRoutes";
import cuotaRoutes from "./routes/cuotaRoutes";

app.use("/api/usuarios", usuarioRoutes);
app.use("/api/configuracion", configRoutes);
app.use("/api/categorias-contables", categoriaContableRoutes);
app.use("/api/movimientos-contables", movimientoContableRoutes);
app.use("/api/cuotas", cuotaRoutes);

export default app;
