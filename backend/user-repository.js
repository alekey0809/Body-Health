import DBlocal from 'db-local';
import crypto from 'crypto';

const { Schema } = new DBlocal({ path: './db' });

const UserModel = Schema('user', {
    _id: { type: 'string', required: true },
    username: { type: 'string', required: true },
    password: { type: 'string', required: true }
});

export class UserRepository {
    static create({ username, password }) {
        // 1. Validaciones de formato
        if (typeof username !== 'string') throw new Error('username must be a string');
        if (username.length < 3) throw new Error('username must be at least 3 characters long');
        if (typeof password !== 'string') throw new Error('password must be a string');
        if (password.length < 6) throw new Error('password must be at least 6 characters long');

        // 2. Validar si el usuario ya existe
        const userExists = UserModel.findOne({ username });
        if (userExists) throw new Error('username already exists');

        // 3. Generar ID único
        const id = crypto.randomUUID();

        // 4. Encriptar contraseña (hashing)
        const hashedPassword = crypto.pbkdf2Sync(password, 'salt-secreto', 1000, 64, 'sha512').toString('hex');

        // 5. Crear y guardar
        UserModel.create({
            _id: id,
            username,
            password: hashedPassword 
        }).save();

        return id;
    }

    static login({ username, password }) {
       
    }
}