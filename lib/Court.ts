import db from './db';

class Court {
    id: number;
    lat: number;
    lon: number;
    address?: string | null;
    

    constructor(id: number, lat: number, lon: number, address?: string | null) {
        this.id = id;
        this.lat = lat;
        this.lon = lon;
        this.address = address;
    }

    static async create(lat: number, lon: number, address?: string | null): Promise<void> {
        return await db.query(
            'INSERT INTO courts(lat, lon, address) VALUES (?, ?, ?)',
            [lat, lon, address]
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
            "SELECT id, lat, lon, address FROM courts WHERE ST_Distance_Sphere(POINT(lon, lat), POINT(?, ?)) < ?",
            [lon, lat, range]
        );
        return result.results;
    }

    get schemaData() {
        return {
            id: this.id,
            lat: this.lat,
            lon: this.lon,
            address: this.address
        }
    }


}

export default Court;