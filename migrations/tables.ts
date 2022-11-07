import db from "../lib/db";

async function initTables() {
    await db.query(`
    CREATE TABLE users (
        id varchar(128) primary key,
        name varchar(30) not null,
        surname varchar(30) not null,
        email varchar(50) not null unique,
        password varchar(255) not null
    );
    CREATE TABLE fields (
        id varchar(128) primary key,
        address varchar(128) not null,
        lat double not null,
        lon double not null
    );
    CREATE TABLE matches (
        id varchar(128) primary key,
        field varchar(128) references fields(id),
        score1 integer not null default 0,
        score2 integer not null default 0
    );
    CREATE TABLE matches_to_users (
        user varchar(128) foreign key references users(id),
        field varchar(128) foreign key references fields(id)
    );
    `)
}