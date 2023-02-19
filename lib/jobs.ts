import Game from "./Game";
import { endGame, getRunningGames } from "./redis";

const cron = require('node-cron');

export const scheduleJobs = () => {
    cron.schedule('* * * * *', async () => {
        console.log("running pruning cron job");
        let runningGames = await getRunningGames();
        console.log(`starting from ${runningGames.length} running games`);
        for(let game of runningGames) {
            if(!await Game.isActive(game)) {
                console.log(`Game ${game} is inactive, pruning`);
                endGame(game);
            }
            
        }
    })
}