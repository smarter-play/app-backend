import * as express from 'express';
import db from '../db'

let router = express.Router();

router.get('/', (req: express.Request, res: express.Response) => {

    res.json({
        success: true,
        message: 'hello'
    })

})

export = router;
