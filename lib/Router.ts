import express from 'express';
import helmet from 'helmet';
import body from 'body-parser';
import HTTPError from './HTTPError'

export default class Router{

    app: express.Application;
    constructor(){
        
        this.app = express();

    }

    init(): void{

        this.app.use(helmet());
        this.app.enable("trust proxy");
        this.app.disable("x-powered-by");
        this.app.use(body.json({ limit: "20mb" }));
        this.app.use(
            body.urlencoded({ limit: "20mb", extended: true, parameterLimit: 100 }),
        );
        this.app.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
            res.header("Access-Control-Allow-Origin", "*");
            res.header('Access-Control-Allow-Methods', '*');
            res.header('Access-Control-Allow-Headers', '*');
            console.log(`${req.method} ${req.path}`);
            try {
                next();
            } catch (e) {
                return res.status(500).send({ error: "Unknown Error" });
            }
        })
        this.app.use('/', require("./routes/main"));
        this.app.use('/auth', require("./routes/auth"));
        this.app.use('/users', require("./routes/users"));
        this.app.use('/courts', require("./routes/courts"));
        this.app.use('/games', require("./routes/games"));
        this.app.use('/baskets', require("./routes/baskets"));
        
        this.app.listen(process.env.PORT);

        this.app.all('*', (req: express.Request, res: express.Response) => {

            return HTTPError.NOT_FOUND.toResponse(res);
            
        })

        console.log(`listening on ${process.env.PORT}`);
    }

}
