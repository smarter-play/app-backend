import db, { connectionQuery } from './db';
import HTTPError from './HTTPError';
import { resetBasket } from './redis';
import Basket from './Basket';
import { Connection } from 'mysql2';
import User from './User';

class Game {
    id: number;
    basket: number;
    score1: number;
    score2: number;
    users: User[];
    created_at: Date;
    

    constructor(id: number, basket: number, score1: number, score2: number, users: User[], created_at: Date) {
        this.id = id;
        this.basket = basket;
        this.score1 = score1;
        this.score2 = score2;
        this.users = users;
        this.created_at = created_at;
    }

    static async create(basket: number, score1?: number, score2?: number): Promise<number> {
        score1 = score1 ?? 0;
        score2 = score2 ?? 0;
        let conn = db.getConnection();
        try {
            let res = await connectionQuery(conn, `INSERT INTO games VALUES ()`);
            let id = res.results.insertId;

            
            await connectionQuery(conn,
                'INSERT INTO simple_games(id, basket, score1, score2) VALUES (?, ?, ?, ?)',
                [id, basket, score1, score2]
            );
            
            let teams = await Basket.getTeams(basket);

            for(let user of teams.team1) {
                await Game.addUser(id, user.id, 1, conn);
            }

            for(let user of teams.team2) {
                await Game.addUser(id, user.id, 2, conn);
            }
            conn.release();
            await resetBasket(basket);
            return id;
        } catch(e) {
            conn.rollback(() => conn.release());
            throw new HTTPError("Error while creating game", 500);
        }
            

    }

    static async getById(id: number): Promise<Game | null> {
        let result =  await db.query(`
            SELECT simple_games.id, basket, score1, score2, created_at, users.id, users.name, users.email, users.password, users.created_at, users.score
            FROM simple_games
            JOIN games_to_users ON games_to_users.game=simple_games.id
            JOIN users ON users.id=games_to_users.user
            WHERE id=?`,
        [id]);
        let el = result.results[0];
        if(el == undefined) return null;

        let users: User[] = [];
        for(let user of result.results) {
            users.push(new User(user.id, user.name, user.email, user.password, user.created_at, user.score));
        }
        return new Game(id, el.basket, el.score1, el.score2, users, el.created_at);
    }

    static async getByUserId(user_id: number): Promise<Game[]> {
        let result =  await db.query(`
            SELECT id, basket, score1, score2, created_at
            FROM simple_games
            WHERE id IN (
                SELECT game FROM games_to_users WHERE user=?
            )
            `, [user_id]);
        return result.results;
    }

    static async addUser(game_id: number, user_id: number, team: number, conn: Connection): Promise<void> {
        return await connectionQuery(conn,
            'INSERT INTO games_to_users(game, user, team) VALUES (?, ?, ?)',
            [game_id, user_id, team]
        );
    }

    static async getGameByBasketId(basket_id: number): Promise<Game[]> {
        let results = db.query("SELECT id, basket, score1, score2, created_at FROM simple_games WHERE basket=?", [basket_id]);
        return results.results;
    }

    static async checkIfBasketHasGame(basket_id: number): Promise<boolean> {
        let result =  await db.query("SELECT id, basket, score1, score2, created_at FROM simple_games WHERE basket=?", [basket_id]);
        return result.results.length > 0;
    }

    static async insertScoreData(basket_id: number, timestamp: Date): Promise<void> {
        await db.query(
            'INSERT INTO score_data(basket_id, timestamp) VALUES (?, ?)',
            [basket_id, timestamp]
        );

        await db.query(
            'UPDATE simple_games SET created_at=? WHERE basket=?',
            [timestamp, basket_id]
        );

    }

    static async insertAccelerometerData(basket_id: number, acc_x: number, acc_y: number, acc_z: number, gyro_x: number, gyro_y: number, gyro_z: number, temperature: number, timestamp: Date): Promise<void> {
        return await db.query(
            'INSERT INTO accelerometer_data(basket_id, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, temperature, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [basket_id, acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, temperature, timestamp]
        );
    }

    static async updateScore(basket_id: number, score1: number, score2: number): Promise<void> {
        return await db.query(
            'UPDATE simple_games SET score1=?, score2=? WHERE basket=?',
            [score1, score2, basket_id]
        );
    }

    static async insertPeopleDetected(basket_id: number): Promise<void> {
        return await db.query(
            'INSERT INTO people_detected(basket) VALUES (?)',
            [basket_id]
        );
    }

    static async addToTeam(team: number, basket_id: number): Promise<void> {
        if(team != 1 && team != 2) throw new HTTPError( "Team must be 1 or 2", 400);
        
    }


    get schemaData() {
        return {
            id: this.id,
            basket: this.basket,
            score1: this.score1,
            score2: this.score2,
            created_at: this.created_at
        }
    }


}

export default Game;