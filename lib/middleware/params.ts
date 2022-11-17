

function checkParamsMiddleware(args: string[], validators: {[key: string]: (p: string) => boolean}) {
    return (req, res, next) => {
        let missingArgs: string[] = [];
        let invalidArgs: string[] = [];
        let source = req.body;
        console.log(source);
        if (req.method === "GET" || req.method == "DELETE") {
            source = req.query;
        }
        for (let arg of args) {
            if (source[arg] == undefined) {
                missingArgs.push(arg);
            }
        }
        if (missingArgs.length != 0) return res.status(400).json({ status: 400, message: "missing arguments: " + JSON.stringify(missingArgs) });
        if (validators) {
            let validatorList = Object.entries(validators);
            for (let [arg, validator] of validatorList) {
                if (source[arg] != undefined && !validator(source[arg])) {
                    invalidArgs.push(arg);
                }
            }
            if (invalidArgs.length != 0) return res.status(400).json({ status: 400, message: "invalid arguments: " + JSON.stringify(invalidArgs) });
        }
        next();
    }
}
export default checkParamsMiddleware;