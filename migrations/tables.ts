import db from "../lib/db";

async function initTables() {
    await db.query(`
    CREATE TABLE IF NOT EXISTS users (
        id varchar(22) primary key,
        name varchar(64) not null,
        surname varchar(64) not null,
        email varchar(50) not null unique,
        date_of_birth date not null,
        password varchar(128) not null
    );
    CREATE TABLE IF NOT EXISTS courts (
        id varchar(128) primary key,
        address varchar(128) not null,
        lat double not null,
        lon double not null
    );
    CREATE TABLE IF NOT EXISTS matches (
        id varchar(128) primary key,
        court varchar(128) references courts(id),
        score1 integer not null default 0,
        score2 integer not null default 0
    );
    CREATE TABLE IF NOT EXISTS matches_to_users (
        user varchar(128) references users(id),
        court varchar(128) references courts(id)
    );
    CREATE TABLE IF NOT EXISTS baskets {

    }
    `)
}

export default initTables;