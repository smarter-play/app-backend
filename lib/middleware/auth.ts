import * as express from 'express';
import User from '../User';

function authMiddleware() {
    return async (req: express.Request, res: express.Response, next) => {
        let authHeader = req.headers["authorization"];
        if (authHeader == undefined) return res.status(401).json({ status: 401, message: "missing authorization header"});
        let token = authHeader.split(" ")[1];
        if(token == undefined) return res.status(401).json({ status: 401, message: "missing token"});
        try {
            let result = await User.verifyJWT(token);
            res.locals.user_id = result.id; 
            next();
        }
        catch(e) {
            return res.status(401).json({ status: 401, message: "invalid token"});
        }
        
    }
}
export default authMiddleware;