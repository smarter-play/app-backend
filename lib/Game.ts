import db from './db';
import HTTPError from './HTTPError';

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

    static async create(basket: number, score1: number, score2: number): Promise<void> {
        let res = await db.query(`INSERT INTO games VALUES ()`);


        let id = res.results.insertId;

        
        return await db.query(
            'INSERT INTO simple_games(id, basket, score1, score2) VALUES (?, ?, ?, ?)',
            [id, basket, score1, score2]
        );
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