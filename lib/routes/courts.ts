import * as express from 'express';
import Court from '../Court';
import checkParamsMiddleware from '../middleware/params';
import { checkNumeric } from '../utils';

let router = express.Router();

router.get('/', checkParamsMiddleware([], {"range": checkNumeric, "lat": checkNumeric, "lon": checkNumeric}), async (req: express.Request, res: express.Response) => {
    if(req.query.range && req.query.lat && req.query.lon) {
        return res.send(await Court.getInRange(parseFloat(req.query.lat as string), parseFloat(req.query.lon as string), parseFloat(req.query.range as string)));
    } else {
        return res.send(await Court.getAll());
    }
})

export = router;