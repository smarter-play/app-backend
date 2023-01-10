import * as express from 'express';
import User from '../User';

let router = express.Router();

router.get('/', async (req: express.Request, res: express.Response) => {
    return res.send(await User.getAll());
})

router.get('/:userId', async(req: express.Request, res: express.Response) => {
    let userId = parseInt(req.params.userId);
    console.log(userId);
    try {
        let user = await User.getById(userId);
        return res.send(user);
    } catch(e) {
        res.status(404).send("Not Found");
    }
})

export = router;