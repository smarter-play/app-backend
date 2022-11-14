import { argon2d } from 'argon2';
import * as express from 'express';
import db from '../db'
import checkParamsMiddleware from '../middleware/params'
import {validateEmail} from '../utils';

let router = express.Router();

router.get('/register', checkParamsMiddleware(["email", "password", "name", "surname", "date_of_birth", "password"], {
    "email": validateEmail,
    "password": (arg: string) => arg.length > 4,
    "name": (arg: string) => arg.length < 64 && arg.length > 0,
    "surname": (arg: string) => arg.length < 64 && arg.length > 0,
}), (req: express.Request, res: express.Response) => {
    
})

export = router;
