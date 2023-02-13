import * as express from 'express';
import Game from '../Game';
import HTTPError from '../HTTPError';
import checkParamsMiddleware from '../middleware/params';
import { checkNumeric } from '../utils';
import { getRunningGames } from '../redis';

let router = express.Router();

router.post('/', checkParamsMiddleware(["basket"], {
    basket: checkNumeric,
}), async (req: express.Request, res: express.Response) => {
    await Game.create(parseInt(req.body.basket));
    
})

router.get('/:gameId', async (req: express.Request, res: express.Response) => {
    let gameId = parseInt(req.params.gameId);
    let game = await Game.getById(gameId);

    if(game == undefined) {
        throw new HTTPError("Game Not Found", 404);
    }

    return res.json(game);
})

router.get('/', checkParamsMiddleware(["user_id"], {
    user_id: checkNumeric,
    running: (running: string) => running == "1" || running == "0",
}), async (req: express.Request, res: express.Response) => {
    let userId = parseInt(req.query.user_id as string);
    let running = req.query.running == "1";
    let notRunning = req.query.running == "0";
    
    let allGames = await Game.getByUserId(userId);


    if(running || notRunning) {
        let runningGames = await getRunningGames();
        return res.json({
            games: allGames.filter((game) => {
                if(running) {
                    return runningGames.includes(game.id);
                } else {
                    return !runningGames.includes(game.id);
                }
            })
        })
    } else {
        return res.json({
            games: allGames
        })
    }
    

})


export = router;