import * as express from 'express';
import Game from '../Game';
import HTTPError from '../HTTPError';
import checkParamsMiddleware from '../middleware/params';
import { checkNumeric } from '../utils';

let router = express.Router();

router.post('/', checkParamsMiddleware(["basket"], {
    basket: checkNumeric,
}), async (req: express.Request, res: express.Response) => {
    await Game.create(parseInt(req.body.basket));
    
})


export = router;