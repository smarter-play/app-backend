CREATE TABLE IF NOT EXISTS users (
    id int primary key AUTO_INCREMENT,
    name varchar(64) not null,
    surname varchar(64) not null,
    email varchar(50) not null unique,
    date_of_birth date not null,
    password varchar(128) not null
);

CREATE TABLE IF NOT EXISTS courts (
    id int primary key AUTO_INCREMENT,
    address varchar(128) not null,
    lat double not null,
    lon double not null
);

CREATE TABLE IF NOT EXISTS matches (
    id int primary key AUTO_INCREMENT,
    court int not null references courts(id),
    score1 int not null default 0,
    score2 int not null default 0
);

CREATE TABLE IF NOT EXISTS matches_to_users (
    user int not null references users(id),
    match int not null references matches(id),
    team tinyint not null
);

CREATE TABLE IF NOT EXISTS baskets (
    id int primary key,
    court int references courts(id)
);
