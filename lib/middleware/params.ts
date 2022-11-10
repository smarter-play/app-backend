

const checkParamsMiddleware = (args, validators) => (req, res, next) => {
    let missing_args = [];
    let invalid_args = [];
    let source = req.body;
    if (req.method === "GET") {
        source = req.query;
    }
    for (let arg of args) {
        if (source[arg] == undefined) {
        missing_args.push(arg);
        }
    }
    if (missing_args.length != 0) return res.status(400).json({ status: 400, message: "missing arguments: " + JSON.stringify(missing_args) });
    if (validators) {
        let validatorList = Object.entries(validators);
        let arg, validator;
        for ([arg, validator] of validatorList) {
        if (source[arg] != undefined && !validator(source[arg])) {
            invalid_args.push(arg);
        }
        }
        if (invalid_args.length != 0) return res.status(400).json({ status: 400, message: "invalid arguments: " + JSON.stringify(invalid_args) });
    }
    next();
}
export default checkParamsMiddleware;