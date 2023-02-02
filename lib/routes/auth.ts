import argon2 from 'argon2';
import * as express from 'express';
import db from '../db'
import checkParamsMiddleware from '../middleware/params'
import {checkPassword, validateEmail} from '../utils';
import User from '../User';
import authMiddleware from '../middleware/auth';

let router = express.Router();

const isValidIsoDate = (date: string) => {
    return !isNaN(Date.parse(date));
}

router.post('/register', checkParamsMiddleware(["email", "password", "name", "surname", "date_of_birth"], {
    "email": validateEmail,
    "password": (arg: string) => arg.length > 4,
    "name": (arg: string) => arg.length < 64 && arg.length > 0,
    "surname": (arg: string) => arg.length < 64 && arg.length > 0,
    "date_of_birth": isValidIsoDate,
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
                return res.status(200).send(await user.generateJWT());
            } else {
                return res.status(401).send("Wrong password");
            }
            
        } catch(e) {
            console.log(e);
            return res.status(404).send("User not found");
        }
    }
)

router.get('/', authMiddleware(), async(req: express.Request, res: express.Response) => {
    let user_id = res.locals["user_id"];
    console.log(user_id);
    let result = await User.getById(user_id);
    return res.status(result != null ? 200 : 404).json(result ?? "Not Found")
});

router.put('/', authMiddleware(), checkParamsMiddleware(["email", "name", "surname", "date_of_birth"], {
    "email": validateEmail,
    "name": (arg: string) => arg.length < 64 && arg.length > 0,
    "surname": (arg: string) => arg.length < 64 && arg.length > 0,
    "date_of_birth": isValidIsoDate,
}), async(req: express.Request, res: express.Response) => {
    let user_id = res.locals["user_id"];
    console.log({user_id});
    let user = await User.getById(user_id);
    await user!.edit(req.body['name'], req.body['surname'], req.body['email'], new Date(req.body['date_of_birth']));
    return res.status(user != null ? 200 : 404).send(user != null ? "success" : "error")
});

export = router;
