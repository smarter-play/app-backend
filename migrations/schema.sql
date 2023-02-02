CREATE TABLE IF NOT EXISTS users (
    id INT NOT NULL AUTO_INCREMENT,
    name varchar(64) not null,
    surname varchar(64) not null,
    email varchar(50) not null unique,
    date_of_birth date not null,
    password varchar(128) not null,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS courts (
    id int not null AUTO_INCREMENT,
    address varchar(128) not null,
    lat double not null,
    lon double not null,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS matches (
    id int not null AUTO_INCREMENT,
    court int not null references courts(id),
    score1 int not null default 0,
    score2 int not null default 0,
    PRIMARY KEY(id)
);

CREATE TABLE IF NOT EXISTS matches_to_users (
    user int not null references users(id),
    match int not null references matches(id),
    team tinyint not null,
    primary key(user, match)
);

CREATE TABLE IF NOT EXISTS baskets (
    id int primary key,
    court int references courts(id)
);