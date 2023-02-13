import db, { connectionQuery } from './db';
import HTTPError from './HTTPError';
import { resetBasket } from './redis';
import Basket from './Basket';
import { Connection } from 'mysql2';

class Game {
    id: number;
    basket: number;
    score1: number;
    score2: number;
    created_at: Date;
    

    constructor(id: number, basket: number, score1: number, score2: number, created_at: Date) {
        this.id = id;
        this.basket = basket;
        this.score1 = score1;
        this.score2 = score2;
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

    static async addUser(game_id: number, user_id: number, team: number, conn: Connection): Promise<void> {
        return await connectionQuery(conn,
            'INSERT INTO games_to_users(game, user, team) VALUES (?, ?, ?)',
            [game_id, user_id, team]
        );
    }

    static async getByBasketId(basket_id: number): Promise<Game[]> {
        let result =  await db.query("SELECT id, basket, score1, score2, created_at FROM simple_games WHERE basket=?", [basket_id]);
        return result.results;
    }

    static async checkIfBasketHasGame(basket_id: number): Promise<boolean> {
        let result =  await db.query("SELECT id, basket, score1, score2, created_at FROM simple_games WHERE basket=? AND score1=0 AND score2=0", [basket_id]);
        return result.results.length > 0;
    }

    static async insertScoreData(basket_id: number): Promise<void> {
        return await db.query(
            'INSERT INTO score_data(basket) VALUES (?)',
            [basket_id]
        );
    }

    static async insertAccelerometerData(basket_id: number, acc_x: number, acc_y: number, acc_z: number, gyro_x: number, gyro_y: number, gyro_z: number, temperature: number): Promise<void> {
        return await db.query(
            'INSERT INTO accelerometer_data(basket, acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, temperature) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [basket_id, acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, temperature]
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