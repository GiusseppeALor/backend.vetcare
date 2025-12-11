import express from "express";
import { db } from "../config/db.js";
import { enviarCorreoSNS } from "../config/sns.js";

const router = express.Router();

/* =====================================================
   📌 1. CREAR CITA + ENVÍO DE CORREO
   ===================================================== */
router.post("/crear", async (req, res) => {
  const { mascota_id, fecha, hora, motivo } = req.body;

  if (!mascota_id || !fecha || !hora) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios." });
  }

  try {
    // Validar disponibilidad
    const [choques] = await db.query(
      "SELECT id FROM citas WHERE fecha = ? AND hora = ? AND mascota_id = ?",
      [fecha, hora, mascota_id]
    );

    if (choques.length > 0) {
      return res.status(400).json({
        mensaje: "La mascota ya tiene una cita en ese horario."
      });
    }

    // Registrar cita
    const [result] = await db.query(
      "INSERT INTO citas (mascota_id, fecha, hora, motivo, estado) VALUES (?, ?, ?, ?, 'PENDIENTE')",
      [mascota_id, fecha, hora, motivo]
    );

    // ==================================
    // 📧 Enviar correo vía SNS
    // ==================================
    const mensajeCorreo = `
Nueva cita registrada en VetCare:

🐾 Mascota ID: ${mascota_id}
📅 Fecha: ${fecha}
⏰ Hora: ${hora}
📝 Motivo: ${motivo}

Estado: PENDIENTE

Gracias por confiar en VetCare.
`;

    await enviarCorreoSNS("Nueva cita registrada - VetCare", mensajeCorreo);

    res.json({
      mensaje: "Cita registrada correctamente",
      cita_id: result.insertId,
      estado: "PENDIENTE"
    });

  } catch (error) {
    console.error("❌ Error al crear cita:", error);
    res.status(500).json({ mensaje: "Error al crear cita" });
  }
});


/* =====================================================
   📌 2. LISTAR CITAS POR USUARIO
   ===================================================== */
router.get("/usuario/:id", async (req, res) => {
  const usuario_id = req.params.id;

  try {
    const [citas] = await db.query(
      `SELECT 
          c.id, 
          c.fecha, 
          c.hora, 
          c.motivo,
          c.estado,
          m.nombre AS mascota
       FROM citas c
       INNER JOIN mascotas m ON c.mascota_id = m.id
       WHERE m.usuario_id = ?
       ORDER BY c.fecha ASC, c.hora ASC`,
      [usuario_id]
    );

    res.json(citas);

  } catch (error) {
    console.error("❌ Error al obtener citas:", error);
    res.status(500).json({ mensaje: "Error al obtener citas" });
  }
});


/* =====================================================
   📌 3. CONFIRMAR CITA + ENVÍO DE CORREO
   ===================================================== */
router.put("/confirmar/:id", async (req, res) => {
  const cita_id = req.params.id;

  try {
    await db.query(
      "UPDATE citas SET estado = 'CONFIRMADA' WHERE id = ?",
      [cita_id]
    );

    // 📧 CORREO SNS
    const mensajeCorreo = `
Tu cita en VetCare ha sido CONFIRMADA.

🆔 Cita ID: ${cita_id}
Estado: CONFIRMADA

¡Te esperamos!
`;

    await enviarCorreoSNS("Cita confirmada - VetCare", mensajeCorreo);

    res.json({ mensaje: "Cita confirmada correctamente" });

  } catch (error) {
    console.error("❌ Error al confirmar cita:", error);
    res.status(500).json({ mensaje: "Error al confirmar cita" });
  }
});


/* =====================================================
   📌 4. CANCELAR CITA + ENVÍO DE CORREO
   ===================================================== */
router.put("/cancelar/:id", async (req, res) => {
  const cita_id = req.params.id;

  try {
    const [cita] = await db.query("SELECT * FROM citas WHERE id = ?", [cita_id]);

    if (cita.length === 0) {
      return res.status(404).json({ mensaje: "La cita no existe." });
    }

    await db.query(
      "UPDATE citas SET estado = 'CANCELADA' WHERE id = ?",
      [cita_id]
    );

    // 📧 CORREO SNS
    const mensajeCorreo = `
Tu cita en VetCare ha sido CANCELADA.

🆔 Cita ID: ${cita_id}
Estado: CANCELADA

Si deseas reagendar, puedes hacerlo desde tu plataforma.
`;

    await enviarCorreoSNS("Cita cancelada - VetCare", mensajeCorreo);

    res.json({
      mensaje: "Cita cancelada correctamente",
      cita_id,
      estado: "CANCELADA"
    });

  } catch (error) {
    console.error("❌ Error al cancelar cita:", error);
    res.status(500).json({ mensaje: "Error al cancelar cita" });
  }
});

export default router;
