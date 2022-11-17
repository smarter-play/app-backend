import argon2 from 'argon2';
import * as express from 'express';
import db from '../db'
import checkParamsMiddleware from '../middleware/params'
import {checkPassword, validateEmail} from '../utils';
import User from '../User';

let router = express.Router();

router.post('/register', checkParamsMiddleware(["email", "password", "name", "surname", "date_of_birth", "password"], {
    "email": validateEmail,
    "password": (arg: string) => arg.length > 4,
    "name": (arg: string) => arg.length < 64 && arg.length > 0,
    "surname": (arg: string) => arg.length < 64 && arg.length > 0,
    "date_of_birth": (arg: string) => arg.length == 10,
}), async (req: express.Request, res: express.Response) => {
    try {
        await User.create(req.body['name'], req.body['surname'], req.body['email'], req.body['password'], new Date(req.body['date_of_birth']));
        return res.status(201).send("success");
    } catch(e) {
        console.log(e);
        return res.status(409).send("user already exists");
    }  
})

router.post('/login', checkParamsMiddleware(["email", "password"], {"email": validateEmail}),
    async (req: express.Request, res: express.Response) => {
        try {
            let user = await User.getByEmail(req.body["email"]);
            if(await checkPassword(user.password!, req.body["password"])) {
                return res.status(200).send(JSON.stringify(user));
            } else {
                return res.status(401).send("Wrong password");
            }
            
        } catch(e) {
            console.log(e);
            return res.status(404).send("User not found");
        }
    }
)

export = router;
