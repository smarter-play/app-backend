import db from './db';
import Court from './Court';
import { addRunningGame, endGame, getTeam } from './redis';
import User from './User';
import Game from './Game';

class Basket {
    id: number;
    court: Court;
    

    constructor(id: number, court: Court) {
        this.id = id;
        this.court = court;
    }

    static async create(id: number, court: number): Promise<void> {

        
        return await db.query(
            'INSERT INTO baskets(id, court) VALUES (?, ?, ?, ?)',
            [id, court]
        );
    }
    

    static async getAll(): Promise<Court[]> {
        let result =  await db.query("SELECT id, lat, lon, address FROM courts");
        return result.results;
    }

    static async getById(id: number): Promise<Court | null> {
        let result =  await db.query("SELECT id, lat, lon, address FROM courts WHERE id=?", [id]);
        let el = result.results[0];
        if(el == undefined) return null;
        return new Court(id, el.lat, el.lon, el.address);
    }

    /// range in metri
    static async getInRange(lat: number, lon: number, range: number): Promise<Court[]> {
        let result = await db.query(
            `
            SELECT b.*, c.id as court_id, c.lat, c.lon, c.address
            FROM baskets b JOIN courts c ON b.court = c.id
            WHERE ST_Distance_Sphere(POINT(c.lon, c.lat), POINT(?, ?)) < ?`,
            [lon, lat, range]
        );
        return result.results;
    }

    static async getTeams(basket_id: number): Promise<{team1: User[], team2: User[]}> {
        let team1 = await getTeam(basket_id, 1);
        let team2 = await getTeam(basket_id, 2);

        let team1_users = await Promise.all(team1.map<Promise<User>>(async (id) => (await User.getById(id))!));
        let team2_users = await Promise.all(team2.map<Promise<User>>(async (id) => (await User.getById(id))!));

        return {
            team1: team1_users,
            team2: team2_users
        };
    }

    static async startGame(basket_id: number): Promise<void> {
        let game_id = await Game.create(basket_id);

        let games = await Game.getAllGamesByBasketId(basket_id);
        for(let game of games) {
            await endGame(game.id);
        }
        await addRunningGame(game_id);
        console.log(`game ID: ${game_id}`);

    }

    

    get schemaData() {
        return {
            id: this.id,
            court: this.court
        }
    }


}

export default Basket;