import Game from './Game';
import * as redis from './redis';

const mqtt = require('mqtt');

export default class MQTTClient{
    client: any;

    constructor(){
        console.log("MQTTClient created");
    }

    init(): void{

        const client = mqtt.connect('mqtt://'+process.env.BROKER_ADDRESS+":"+process.env.BROKER_PORT);
        
        client.on('connect', function () {
            client.subscribe('#', function (err) {
                if (!err) {
                    console.log("MQTTClient connected");
                }
            })
        })

        client.on('message', (topic, message) => {
            
            console.log('Received message from topic:', topic);
            message = JSON.parse(message.toString());
            console.log(message);

            /* codice inutilizzato e che rompe tutto per ora
            const basket_id = message.metadata[0];
            const hasGame = Game.checkIfBasketHasGame(basket_id);*/

            switch(message.type){
                case "SCORE":
                    this.on_score(message);
                    break;
                case "ACCELEROMETER":
                    this.on_accelerometer(message);
                    break;
                case "CUSTOM_BUTTON":
                    this.on_custom_button(message);
                    break;
                case "PEOPLE_DETECTED":
                    this.on_people_detected(message);
                    break;
                default:
                    console.log("Unknown message type");
            }
        })

    }

    on_score(message: any): void{
        const basket_id = message.metadata[0];
        console.log("SCORE: received from basket " + basket_id);
    
        Game.insertScoreData(basket_id);

        // setta in redis che è stato fatto un canestro
        redis.setHasScored(basket_id);
    }

    on_accelerometer(message: any): void{
        const basket_id = message.metadata[0];
        const acc_x = message.metadata[1];
        const acc_y = message.metadata[2];
        const acc_z = message.metadata[3];
        const gyro_x = message.metadata[4];
        const gyro_y = message.metadata[5];
        const gyro_z = message.metadata[6];
        const temp = message.metadata[7];
        console.log("ACCELEROMETER: received from basket " + basket_id);

        Game.insertAccelerometerData(basket_id, acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, temp);
    }

    on_custom_button(message: any): void{
        const basket_id = message.metadata[0];
        const button_id = message.metadata[1];

        const game = Game.getByBasketId(basket_id);
        const score1 = game[0].score1;
        const score2 = game[0].score2;

        // controlla in redis se è stato fatto un canestro,
        // resetta a 0 in redis il flag che controlla se è stato fatto un canestro

        redis.getHasScored(basket_id).then((hasScored: boolean) => {
            
            switch(button_id){
                case 1:
                    Game.updateScore(basket_id, score1 + 1, score2);
                    break;
                case 2:
                    Game.updateScore(basket_id, score1, score2 + 1);
                    break;
                default:
                    console.log("Unknown button id");
            }

        });

        redis.resetHasScored(basket_id);

        console.log("CUSTOM_BUTTON: received from basket " + basket_id + " button " + button_id)
    }

    on_people_detected(message: any): void{
        const basket_id = message.metadata[0];
        console.log("PEOPLE_DETECTED: received from basket " + basket_id);

        Game.insertPeopleDetected(basket_id);
    }

}

