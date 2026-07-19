import { UserModel } from '../models/user.model.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

// CONTROLADOR DEL REGISTRO
export const register = async (req, res) => {
    try {
        const newUser = await UserModel.create(req.body);
        return res.status(201).json({
            ok: true,
            message: "Usuario registrado con éxito",
            user: newUser
        });
    } catch (error) {
        console.error(error);
        // Validar si el correo o documento ya existen (Error 23505 en Postgres es Unique Violation)
        if (error.code === '23505') {
            return res.status(400).json({ ok: false, message: "El correo electrónico o número de documento ya están registrados" });
        }
        return res.status(500).json({ ok: false, message: "Error interno del servidor" });
    }
};

// CONTROLADOR DEL LOGIN
export const login = async (req, res) => {
    const { correo, contrasena } = req.body;

    try {
        // 1. Buscar si el usuario existe en la base de datos
        const user = await UserModel.findByEmail(correo);
        if (!user) {
            return res.status(404).json({ ok: false, message: "Credenciales incorrectas (Correo no encontrado)" });
        }

        // 2. Validar que el usuario esté activo (u_eg_id = 1, según tus catálogos)
        if (user.u_eg_id !== 1) {
            return res.status(403).json({ ok: false, message: "Tu usuario no está activo en el sistema. Habla con administración." });
        }

        // 3. Cifrar la contraseña recibida para compararla con la de la BD
        const hashInput = crypto.createHash('sha256').update(contrasena).digest('hex');

        if (hashInput !== user.u_contrasena) {
            return res.status(401).json({ ok: false, message: "Credenciales incorrectas (Contraseña inválida)" });
        }

        // 4. Éxito
        const tokenPayload = {
            id: user.u_id,
            correo: user.u_correo_electronico,
            rol: user.u_r_id
        };
        const token = jwt.sign(tokenPayload, process.env.JWT_SECRET || 'secreto_super_seguro_development', { expiresIn: '8h' });

        return res.status(200).json({
            ok: true,
            message: "¡Login exitoso!",
            token,
            user: {
                id: user.u_id,
                nombre: `${user.u_nombres} ${user.u_apellidos}`,
                correo: user.u_correo_electronico,
                u_r_id: user.u_r_id
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, message: "Error interno en el servidor" });
    }
};

// CONTROLADOR DE ACTUALIZACIÓN DE PERFIL
export const updateProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const { nombres, apellidos, contacto } = req.body;

        if (!nombres || !apellidos) {
            return res.status(400).json({ ok: false, message: "El nombre y apellido son requeridos." });
        }

        // contacto es opcional, si no viene se envía null
        const contactoFinal = contacto?.trim() || null;

        const updatedUser = await UserModel.updateProfile(userId, { nombres, apellidos, contacto: contactoFinal });

        if (!updatedUser) {
            return res.status(404).json({ ok: false, message: "Usuario no encontrado." });
        }

        return res.status(200).json({
            ok: true,
            message: "Perfil actualizado correctamente.",
            user: {
                id: updatedUser.u_id,
                nombre: `${updatedUser.u_nombres} ${updatedUser.u_apellidos}`,
                correo: updatedUser.u_correo_electronico,
                contacto: updatedUser.u_numero_contacto,
                u_r_id: updatedUser.u_r_id
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ ok: false, message: "Error interno al actualizar el perfil." });
    }
};
