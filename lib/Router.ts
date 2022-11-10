import express from 'express';
const helmet = require('helmet');
const fileUpload = require('express-fileupload');
const body = require("body-parser");
import HTTPError from './HTTPError'

export default class Router{

    app: express.Application;
    constructor(){
        
        this.app = express();

    }

    init(): void{

        this.app.use(helmet());
        this.app.use(fileUpload({createParentPath: true, abortOnLimit: '20m', useTempFiles: true, tempFileDir: './tmp'}));
        this.app.enable("trust proxy");
        this.app.disable("x-powered-by");
        this.app.use(body.json({ limit: "20mb" }));
        this.app.use(
            body.urlencoded({ limit: "20mb", extended: true, parameterLimit: 100 }),
        );

        this.app.use('/', require("./routes/main"));
        
        this.app.listen(process.env.PORT);

        this.app.all('*', (req: express.Request, res: express.Response) => {

            return HTTPError.NOT_FOUND.toResponse(res);
            
        })

        console.log(`listening on ${process.env.PORT}`);
    }

}
