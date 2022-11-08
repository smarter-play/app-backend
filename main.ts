'use strict'
import * as dotenv from "dotenv";
import Router from "./lib/Router";
import db from "./lib/db";
import initTables from './migrations/tables';

dotenv.config();

const router = new Router();
router.init();

db.init();
console.log("hot reloading!")
import user from './lib/User'
initTables().then(async _ => {
    await user.create("nome", "cognome", "prova@prova.com", "prova", new Date())
    console.log("fatto")
});
