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
                case "INFO":
                    this.on_info(message);
                    break;
                default:
                    console.log("Unknown message type");
            }
        })

    }

    async on_score(message: any): Promise<void>{
        const basket_id = message.metadata[0] >>>0;

        const timestamp = new Date(message.timestamp * 1000);
        console.log("SCORE: received from basket " + basket_id);
    
        Game.insertScoreData(basket_id, timestamp).catch((err: any) => {
            console.log(err);
        });

        // setta in redis che è stato fatto un canestro
        await redis.setHasScored(basket_id);
    }

    on_accelerometer(message: any): void{
        const basket_id = message.metadata[0] >>>0;
        const acc_x = message.metadata[1];
        const acc_y = message.metadata[2];
        const acc_z = message.metadata[3];
        const gyro_x = message.metadata[4];
        const gyro_y = message.metadata[5];
        const gyro_z = message.metadata[6];
        const temp = message.metadata[7];
        const timestamp = new Date(message.timestamp * 1000);

        console.log("ACCELEROMETER: received from basket " + basket_id);

        Game.insertAccelerometerData(basket_id, acc_x, acc_y, acc_z, gyro_x, gyro_y, gyro_z, temp, timestamp).catch((err: any) => {
            console.log(err);
        });

    }

    async on_custom_button(message: any): Promise<void>{
        const basket_id = message.metadata[0] >>> 0;
        const button_id = message.metadata[1][0];

        // controlla in redis se è stato fatto un canestro,
        // resetta a 0 in redis il flag che controlla se è stato fatto un canestro

        await redis.getHasScored(basket_id).then(async (hasScored: boolean) => {
            if (!hasScored) return;

            const game = await Game.getGameByBasketId(basket_id).catch((err: any) => {
                console.log(err);
            });
            if (game == null) return;
            
            // prendi il primo risultato della select
            const score1 = game[0].score1;
            const score2 = game[0].score2;
            
            switch(button_id){
                case 0:
                    Game.updateScore(basket_id, score1 + 1, score2);
                    break;
                case 1:
                    Game.updateScore(basket_id, score1, score2 + 1);
                    break;
                default:
                    console.log("Unknown button id");
            }

        }).catch((err: any) => {
            console.log(err);
        });

        await redis.resetHasScored(basket_id).catch((err: any) => {
            console.log(err);
        });

        console.log("CUSTOM_BUTTON: received from basket " + basket_id + " button " + button_id)
    }

    on_people_detected(message: any): void{
        const basket_id = message.metadata[0] >>>0;
        console.log("PEOPLE_DETECTED: received from basket " + basket_id);

        // Game.insertPeopleDetected(basket_id);
    }

    on_info(message: any): void{
        const bridge_id = message.metadata[0];
        const city = message.metadata[1];
        const manufacturer = message.metadata[2];
        const software_version = message.metadata[3];

        console.log("INFO: received from bridge " + bridge_id);
        console.log("City: " + city);
        console.log("Manufacturer: " + manufacturer);
        console.log("Software version: " + software_version);
    }
}
