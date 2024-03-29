import * as express from 'express';
import Basket from '../Basket';
import authMiddleware from '../middleware/auth';
import checkParamsMiddleware from '../middleware/params';
import { checkNumeric } from '../utils';
import { addToTeam, setReady, getReady, getRunningGames } from '../redis';
import { getCurrentOccupation, forecastOccupation } from '../occupation';
import Game from '../Game';

let router = express.Router();

router.get('/', checkParamsMiddleware([], {"range": checkNumeric, "lat": checkNumeric, "lon": checkNumeric}),
async (req: express.Request, res: express.Response) => {
    if(req.query.range && req.query.lat && req.query.lon) {
        let baskets = await Basket.getInRange(parseFloat(req.query.lat as string), parseFloat(req.query.lon as string), parseFloat(req.query.range as string))

        for(let basket of baskets) {
            console.log("occupation request")
            basket["occupation"] = Math.round((await getCurrentOccupation(basket.id)).occupation*100);
        }

        return res.json(baskets);
    } else {
        return res.json(await Basket.getAll());
    }
})

router.get('/:basketId/forecast', checkParamsMiddleware(["time"], {}), async (req: express.Request, res: express.Response) => {
    let basketId = parseInt(req.params.basketId);
    let time = new Date(req.query.time as string);

    let basket = await Basket.getById(basketId); // switch to calculating history days from basket data

    let history_days = 30;

    let occupation = Math.round((await forecastOccupation(basketId, time, history_days)).occupation*100);

    return res.send({
        occupation
    });
})

router.post('/:basketId/players', authMiddleware(), checkParamsMiddleware(["team"], {
    team: checkNumeric,
}), async (req: express.Request, res: express.Response) => {
    let user = res.locals.user_id;
    let basket = parseInt(req.params.basketId);
    let team = parseInt(req.body.team);

    await addToTeam(basket, team, user);

    return res.send("OK");
});

router.put('/:basketId/:teamId/ready', authMiddleware(), checkParamsMiddleware(["ready"], {
    ready: (ready: string) => ready == "1" || ready == "0",
}), async (req: express.Request, res: express.Response) => {
    let user = res.locals.user_id;
    let basket = parseInt(req.params.basketId);
    let ready = req.body.ready;
    let team = parseInt(req.params.teamId);

    await setReady(basket, team, user, ready);
    console.log("set ready to "+ready);
    if(await getReady(basket)) {
        console.log(`creating name on basket ${basket}`);
        await Basket.startGame(basket);
    }

    return res.send("OK");
});

router.get('/:basketId', async (req: express.Request, res: express.Response) => {
    let basketId = parseInt(req.params.basketId);

    return res.json((await Basket.getTeams(basketId)));
});

router.get('/:basketId/running', async (req: express.Request, res: express.Response) => {
    let basketId = parseInt(req.params.basketId);
    let allGames = await Game.getAllGamesByBasketId(basketId);
    let runningGames = await getRunningGames();
    console.log({filtered: allGames.filter(game => runningGames.includes(game.id))})
    return res.json({
        running: allGames.filter(game => runningGames.includes(game.id))
    });
});


export = router;