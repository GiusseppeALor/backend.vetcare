import { db } from "../config/db.js";

export async function registrarUsuario(req, res) {
  const { nombre, email, password } = req.body;

  try {
    const [existe] = await db.query(
      "SELECT * FROM usuarios WHERE email = ?",
      [email]
    );

    if (existe.length > 0)
      return res.status(400).json({ mensaje: "El email ya existe" });

    await db.query(
      "INSERT INTO usuarios (nombre, email, password) VALUES (?, ?, ?)",
      [nombre, email, password]
    );

    res.json({ mensaje: "Usuario registrado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
