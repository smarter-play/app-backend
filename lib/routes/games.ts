import * as express from 'express';
import Game from '../Game';
import checkParamsMiddleware from '../middleware/params';
import { checkNumeric } from '../utils';

let router = express.Router();

router.post('/', checkParamsMiddleware([], {"range": checkNumeric, "lat": checkNumeric, "lon": checkNumeric}), async (req: express.Request, res: express.Response) => {
    
})

export = router;