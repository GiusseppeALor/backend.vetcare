import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import usuariosRoutes from "./routes/usuarios.js";
import citasRoutes from "./routes/citas.js";
import { db } from "./config/db.js";
import mascotasRoutes from "./routes/mascotas.js";


dotenv.config();

const app = express();

// ==========================
// 🔥 MIDDLEWARES (DEBEN IR PRIMERO)
// ==========================
app.use(cors());
app.use(express.json()); // ← NECESARIO para que req.body funcione
app.use(express.urlencoded({ extended: true }));

// ==========================
// 🧪 TEST DE CONEXIÓN
// ==========================
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT NOW() AS fecha");
    res.json({
      status: "OK",
      message: "Conexión exitosa a AWS RDS",
      fecha: rows[0].fecha
    });
  } catch (error) {
    console.error("❌ Error en conexión a RDS:", error);
    res.status(500).json({
      status: "ERROR",
      message: "No se pudo conectar a AWS RDS",
      error: error.message
    });
  }
});

// ==========================
// 🔄 RUTAS (SE CARGAN DESPUÉS)
// ==========================
app.use("/api/usuarios", usuariosRoutes);
app.use("/api/citas", citasRoutes);
app.use("/api/mascotas", mascotasRoutes);

// ==========================
// RUTA PRINCIPAL
// ==========================
app.get("/", (req, res) => {
  res.send("API VetCare funcionando correctamente");
});

// ==========================
// SERVIDOR
// ==========================
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log("Servidor corriendo en el puerto " + PORT);
});
