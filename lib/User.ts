import db from './db';
import { nanoid } from 'nanoid'
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';

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
        console.log("generato id");
        try {
        let pw = await argon2.hash(password);
        console.log([ name, surname, email, pw, date_of_birth.toISOString().slice(0,10)]);
        return await db.query(
            'INSERT INTO users(name, surname, email, password, date_of_birth) VALUES (?, ?, ?, ?, ?)',
            [name, surname, email, pw, date_of_birth.toISOString().slice(0,10)]
        );
        } catch(e) {console.log(e);}
        
    }

    toJSON() {
        // TODO:inmplement
    }

    static async getAll(): Promise<User[]> {
        let result =  await db.query("SELECT id, name, surname, email, date_of_birth FROM users");
        return result.results;
    }

    static async getById(id: string): Promise<User> {
        let result =  await db.query("SELECT id, name, surname, email, date_of_birth FROM users WHERE id=?", [id]);
        let el = result[0];
        return new User(el.id, el.name, el.surname, el.email, new Date(el.date_of_birth));
    }

    static async getByEmail(email: string): Promise<User> {
        let result =  await db.query("SELECT id, name, surname, email, date_of_birth, password FROM users WHERE email=?", [email]);
        
        if(result.results.length === 0) throw Error();
        let el = result.results[0];
        return new User(el.id, el.name, el.surname, el.email, new Date(el.date_of_birth), el.password);
    }

    async generateJWT(): Promise<string> {
        return await jwt.sign(this.schemaData, process.env.JWT_SIGNING_KEY);
    }

    get schemaData() {
        return {
            id: this.id,
            email: this.email,
            name: this.name,
            surname: this.surname,
            date_of_birth: this.date_of_birth,
        }
    }


}

export default User;