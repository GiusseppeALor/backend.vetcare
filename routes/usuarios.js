import express from "express";
import { db } from "../config/db.js";

const router = express.Router();

// =========================
// REGISTRO
// =========================
router.post("/registrar", async (req, res) => {
  const { nombre, email, password } = req.body;

  try {
    // Verificar si el email ya existe
    const [existe] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (existe.length > 0) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    // Insertar usuario
    await db.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, password]
    );

    res.json({ mensaje: "Usuario registrado correctamente" });

  } catch (error) {
    console.error("Error registro:", error);
    res.status(500).json({ mensaje: "Error en el servidor" });
  }
});

// =========================
// LOGIN
// =========================
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const [rows] = await db.query("SELECT * FROM usuarios WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(400).json({ mensaje: "Usuario no encontrado" });
    }

    const usuario = rows[0];

    if (usuario.password !== password) {
      return res.status(400).json({ mensaje: "Contraseña incorrecta" });
    }

    res.json({
      mensaje: "Login exitoso",
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: "Error al iniciar sesión" });
  }
});

export default router;
