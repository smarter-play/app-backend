import db from './db';
import { nanoid } from 'nanoid'
import argon2 from 'argon2';

class User {
    id: string;
    name: string;
    surname: string;
    email: string;
    date_of_birth: Date;
    password?: string;
    

    constructor(id: string, name: string, surname: string, email: string, date_of_birth: Date, password?: string) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.password = password;
        this.date_of_birth = date_of_birth;
    }

    static async create(name: string, surname: string, email: string, password: string, date_of_birth: Date): Promise<void> {
        let id = nanoid();
        let pw = argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            hashLength: 50,
            timeCost: 4
        });
        return await db.query(
            'INSERT INTO users(id, name, surname, email, password, date_of_birth) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id, name, surname, email, pw, date_of_birth.toISOString().slice(0, 19).replace('T', ' ')]
        );
    }


    static async getAll(): Promise<User[]> {
        let result =  await db.query("SELECT id, name, surname, email, date_of_birth FROM users");
        return result.map(el => new User(el.id, el.name, el.surname, el.email, new Date(el.date_of_birth)));
    }

    static async getById(id: string): Promise<User> {
        let result =  await db.query("SELECT id, name, surname, email, date_of_birth FROM users WHERE id=?", [id]);
        let el = result[0];
        return new User(el.id, el.name, el.surname, el.email, new Date(el.date_of_birth));
    }


}

export default User;