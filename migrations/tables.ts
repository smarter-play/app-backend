import db from "../lib/db";

async function initTables() {
    await db.query(`
    CREATE TABLE IF NOT EXISTS users (
        id int not null AUTO_INCREMENT,
        name varchar(64) not null,
        surname varchar(64) not null,
        email varchar(50) not null unique,
        date_of_birth date not null,
        password varchar(128) not null,
        score int not null default 0,
        PRIMARY KEY(id)
    );
    
    CREATE TABLE IF NOT EXISTS courts (
        id int not null AUTO_INCREMENT,
        address varchar(128) not null,
        lat double not null,
        lon double not null,
        PRIMARY KEY(id)
    );
    
    CREATE TABLE IF NOT EXISTS games (
        id int not null AUTO_INCREMENT,
        PRIMARY KEY(id)
    );
    
    CREATE TABLE IF NOT EXISTS classic_games (
        id int references games(id),
        court int not null references courts(id),
        score1 int not null default 0,
        score2 int not null default 0
    );
    
    CREATE TABLE IF NOT EXISTS games_to_users (
        user int not null references users(id),
        game int not null references games(id),
        team tinyint not null,
        primary key(user, game)
    );
    
    CREATE TABLE IF NOT EXISTS baskets (
        id int primary key AUTO_INCREMENT,
        court int references courts(id)
    );    
    
        
    
    
    
    `)
}

export default initTables;