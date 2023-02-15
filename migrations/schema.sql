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
    address varchar(128),
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

CREATE TABLE IF NOT EXISTS baskets (
    id int unsigned primary key,
    court int references courts(id)
);    

CREATE TABLE IF NOT EXISTS simple_games (
    id int references games(id),
    basket int unsigned not null references baskets(id),
    score1 int not null default 0,
    score2 int not null default 0,
    created_at timestamp not null default now()
);

CREATE TABLE IF NOT EXISTS games_to_users (
    user int not null references users(id),
    game int not null references simple_games(id),
    team tinyint not null,
    primary key(user, game)
);

CREATE TABLE IF NOT EXISTS accelerometer_data(
    id int primary key AUTO_INCREMENT,
    basket_id int unsigned not null,
    accel_x float not null,
    accel_y float not null,
    accel_z float not null,
    gyro_x float not null,
    gyro_y float not null,
    gyro_z float not null,
    temperature float not null,
    timestamp timestamp not null
);

CREATE TABLE IF NOT EXISTS score_data(
    id int primary key AUTO_INCREMENT,
    basket_id int unsigned not null,
    timestamp timestamp not null
);

CREATE TABLE IF NOT EXISTS people_detected_data(
    id int primary key AUTO_INCREMENT,
    basket_id int unsigned not null,
    timestamp timestamp not null
);
