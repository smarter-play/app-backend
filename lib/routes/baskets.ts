import * as express from 'express';
import Basket from '../Basket';
import authMiddleware from '../middleware/auth';
import checkParamsMiddleware from '../middleware/params';
import { checkNumeric } from '../utils';
import { addToTeam, setReady, getReady } from '../redis';

let router = express.Router();

router.get('/', checkParamsMiddleware([], {"range": checkNumeric, "lat": checkNumeric, "lon": checkNumeric}),
async (req: express.Request, res: express.Response) => {
    if(req.query.range && req.query.lat && req.query.lon) {
        return res.send(await Basket.getInRange(parseFloat(req.query.lat as string), parseFloat(req.query.lon as string), parseFloat(req.query.range as string)));
    } else {
        return res.send(await Basket.getAll());
    }
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

router.put('/:basketId/:teamId/ready', authMiddleware(), async (req: express.Request, res: express.Response) => {
    let user = res.locals.user_id;
    let basket = parseInt(req.params.basketId);

    let team = parseInt(req.params.teamId);

    await setReady(basket, team, user);
    if(await getReady(basket)) {
        await Basket.startGame(basket);
    }

    return res.send("OK");
});

router.get('/:basketId', async (req: express.Request, res: express.Response) => {
    let basketId = parseInt(req.params.basketId);

    return res.json((await Basket.getTeams(basketId)));
});

export = router;