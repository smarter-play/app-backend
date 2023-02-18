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
    team1: User[];
    team2: User[];
    created_at: Date;
    

    constructor(id: number, basket: number, score1: number, score2: number, team1: User[], team2: User[], created_at: Date) {
        this.id = id;
        this.basket = basket;
        this.score1 = score1;
        this.score2 = score2;
        this.team1 = team1;
        this.team2 = team2;
        this.created_at = created_at;
    }

    static async create(basket: number, score1?: number, score2?: number): Promise<number> {
        score1 = score1 ?? 0;
        score2 = score2 ?? 0;
        let conn = await db.getConnection();
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
            console.log(e);
            conn.rollback(() => conn.release());
            throw new HTTPError("Error while creating game", 500);
        }
            

    }

    static async getById(id: number): Promise<Game | null> {
        let result =  await db.query(`
            SELECT
                simple_games.id,
                basket,
                score1,
                score2,
                created_at,
                u1.id as u1_id,
                u1.name as u1_name,
                u1.surname as u1_surname,
                u1.email as u1_email,
                u1.date_of_birth as u1_date_of_birth,
                u1.score as u1_score,
                u2.id as u2_id,
                u2.name as u2_name,
                u2.surname as u2_surname,
                u2.email as u2_email,
                u2.date_of_birth as u2_date_of_birth,
                u2.score as u2_score
            FROM simple_games
            LEFT JOIN games_to_users gtu1 ON gtu1.team = 1 AND  gtu1.game = simple_games.id
            LEFT JOIN games_to_users gtu2 ON gtu2.team = 2 AND gtu2.game = simple_games.id
            LEFT JOIN users u1 ON u1.id=gtu1.user
            LEFT JOIN users u2 ON u2.id=gtu2.user
            WHERE simple_games.id=?`,
        [id]);

        let e = result.results[0];
        if(e == undefined) throw new HTTPError(`game ${id} not found`, 404)
        let el = {
            id: e.id,
            basket: e.basket,
            score1: e.score1,
            score2: e.score2,
            created_at: e.created_at,
            team1: [],
            team2: [],
        };

        for(let elem of result.results) {
            if(elem.u1_id != null)
                (el.team1 as User[]).push(new User(elem.u1_id, elem.u1_name, elem.u1_surname, elem.u1_email, elem.u1_date_of_birth, elem.u1_score));
            if(elem.u2_id != null)
                (el.team2 as User[]).push(new User(elem.u2_id, elem.u2_name, elem.u2_surname, elem.u2_email, elem.u2_date_of_birth, elem.u2_score));
        }

        return new Game(el.id, el.basket, el.score1, el.score2, el.team1, el.team2, el.created_at);
    }

    static async getByUserId(user_id: number): Promise<Game[]> {
        let results =  await db.query(`
            SELECT
                simple_games.id,
                basket,
                score1,
                score2,
                created_at,
                u1.id as u1_id,
                u1.name as u1_name,
                u1.surname as u1_surname,
                u1.email as u1_email,
                u1.date_of_birth as u1_date_of_birth,
                u1.score as u1_score,
                u2.id as u2_id,
                u2.name as u2_name,
                u2.surname as u2_surname,
                u2.email as u2_email,
                u2.date_of_birth as u2_date_of_birth,
                u2.score as u2_score
            FROM simple_games
            LEFT JOIN games_to_users gtu1 ON gtu1.team = 1 AND  gtu1.game = simple_games.id
            LEFT JOIN games_to_users gtu2 ON gtu2.team = 2 AND gtu2.game = simple_games.id
            LEFT JOIN users u1 ON u1.id=gtu1.user
            LEFT JOIN users u2 ON u2.id=gtu2.user
            WHERE simple_games.id IN (
                SELECT game FROM games_to_users WHERE user=?
            )`, 
            [user_id]);

            let map: {[key: number]: any} = {};

            for(let el of results.results) {
                if(map[el.id] as any == undefined) {
                    map[el.id] = {
                        id: el.id,
                        basket: el.basket,
                        score1: el.score1,
                        score2: el.score2,
                        created_at: el.created_at,
                        team1: el.u1_id != null ? [new User(el.u1_id, el.u1_name, el.u1_surname, el.u1_email, el.u1_date_of_birth, el.u1_score)] : [],
                        team2: el.u2_id != null ? [new User(el.u2_id, el.u2_name, el.u2_surname, el.u2_email, el.u2_date_of_birth, el.u2_score)] : [],
                    }
                } else {
                    if(el.u1_id != null)
                        (map[el.id].team1 as User[]).push(
                            new User(
                                el.u1_id,
                                el.u1_name,
                                el.u1_surname,
                                el.u1_email,
                                el.u1_date_of_birth,
                                el.u1_score
                            )
                        );
                    if(el.u2_id != null)
                        (map[el.id].team2 as User[]).push(
                            new User(
                                el.u2_id,
                                el.u2_name,
                                el.u2_surname,
                                el.u2_email,
                                el.u2_date_of_birth,
                                el.u2_score
                            )
                        );
                }
                
            }
        
            return Object.values(map);
    
    }

    static async addUser(game_id: number, user_id: number, team: number, conn: Connection): Promise<void> {
        return await connectionQuery(conn,
            'INSERT INTO games_to_users(game, user, team) VALUES (?, ?, ?)',
            [game_id, user_id, team]
        );
    }

    static async getGameByBasketId(basket_id: number): Promise<Game | null> {
        let results = await db.query(`
        SELECT id, basket, score1, score2, created_at
        FROM simple_games
        WHERE basket=?
        ORDER BY created_at DESC`, [basket_id]);

        if (results.results.length == 0) return null;
        let el = results.results[0];
        if (el == undefined) return null;
        return new Game(el.id, el.basket, el.score1, el.score2, [], [], el.created_at);
    }

    static async getAllGamesByBasketId(basket_id: number): Promise<Game[]> {
        let results = await db.query(`
            SELECT
                simple_games.id,
                basket,
                score1,
                score2,
                created_at,
                u1.id as u1_id,
                u1.name as u1_name,
                u1.surname as u1_surname,
                u1.email as u1_email,
                u1.date_of_birth as u1_date_of_birth,
                u1.score as u1_score,
                u2.id as u2_id,
                u2.name as u2_name,
                u2.surname as u2_surname,
                u2.email as u2_email,
                u2.date_of_birth as u2_date_of_birth,
                u2.score as u2_score
            FROM simple_games
            LEFT JOIN games_to_users gtu1 ON gtu1.team = 1 AND  gtu1.game = simple_games.id
            LEFT JOIN games_to_users gtu2 ON gtu2.team = 2 AND gtu2.game = simple_games.id
            LEFT JOIN users u1 ON u1.id=gtu1.user
            LEFT JOIN users u2 ON u2.id=gtu2.user
            WHERE
                basket=?`, [basket_id]);


        let map: {[key: number]: any} = {};

        for(let el of results.results) {
            if(map[el.id] as any == undefined) {
                map[el.id] = {
                    id: el.id,
                    basket: el.basket,
                    score1: el.score1,
                    score2: el.score2,
                    created_at: el.created_at,
                    team1: el.u1_id != null ? [new User(el.u1_id, el.u1_name, el.u1_surname, el.u1_email, el.u1_date_of_birth, el.u1_score)] : [],
                    team2: el.u2_id != null ? [new User(el.u2_id, el.u2_name, el.u2_surname, el.u2_email, el.u2_date_of_birth, el.u2_score)] : [],
                }
            } else {
                if(el.u1_id != null)
                    (map[el.id].team1 as User[]).push(
                        new User(
                            el.u1_id,
                            el.u1_name,
                            el.u1_surname,
                            el.u1_email,
                            el.u1_date_of_birth,
                            el.u1_score
                        )
                    );
                if(el.u2_id != null)
                    (map[el.id].team2 as User[]).push(
                        new User(
                            el.u2_id,
                            el.u2_name,
                            el.u2_surname,
                            el.u2_email,
                            el.u2_date_of_birth,
                            el.u2_score
                        )
                    );
            }
            
        }
    
        return Object.values(map);
    }

    static async checkIfBasketExists(basket_id: number): Promise<boolean> {
        let results = await db.query("SELECT id FROM baskets WHERE id=?", [basket_id]);
        return results.results.length > 0;
    }

    static async createBasket(basket_id: number, court: number): Promise<void> {
        await db.query("INSERT INTO baskets(id, court) VALUES (?, ?)", [basket_id, court]);
    }

    static async insertScoreData(basket_id: number, timestamp: Date): Promise<void> {
        await db.query(
            'INSERT INTO score_data(basket_id, timestamp) VALUES (?, ?)',
            [basket_id, timestamp]
        );
    }

    static async insertAccelerometerData(basket_id: number, acc_x: number, acc_y: number, acc_z: number, gyro_x: number, gyro_y: number, gyro_z: number, temperature: number, timestamp: Date): Promise<void> {
        return await db.query(
            'INSERT INTO accelerometer_data(basket_id, accel_x, accel_y, accel_z, gyro_x, gyro_y, gyro_z, temperature, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [basket_id, acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, temperature, timestamp]
        );
    }

    static async insertPeopleDetected(basket_id: number, timestamp: Date): Promise<void> {
        return await db.query(
            'INSERT INTO people_detected_data(basket_id, timestamp) VALUES (?, ?)',
            [basket_id, timestamp]
        );
    }

    static async incrementScore1(game_id: number): Promise<void> {
        await db.query(
            'UPDATE simple_games SET score1=score1+1 WHERE id=?',
            [game_id]
        );

        await db.query(`
            UPDATE users SET score=score+1
            WHERE id IN (
                SELECT user
                FROM games_to_users
                WHERE game = ? AND team = 1
            )
        `, [game_id])


    }

    static async incrementScore2(game_id: number): Promise<void> {
        await db.query(
            'UPDATE simple_games SET score2=score2+1 WHERE id=?',
            [game_id]
        );

        await db.query(`
            UPDATE users SET score=score+1
            WHERE id IN (
                SELECT user
                FROM games_to_users
                WHERE game = ? AND team = 2
            )
        `, [game_id])
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