import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// Mascotas por usuario
router.get("/usuario/:id", async (req, res) => {
  const usuario_id = req.params.id;

  try {
    const [mascotas] = await db.query(
      "SELECT * FROM mascotas WHERE usuario_id = ?",
      [usuario_id]
    );

    res.json(mascotas);

  } catch (error) {
    console.error("Error al obtener mascotas:", error);
    res.status(500).json({ mensaje: "Error al obtener mascotas" });
  }
});

export default router;
