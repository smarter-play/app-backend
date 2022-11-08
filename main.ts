'use strict'
import * as dotenv from "dotenv";
import Router from "./lib/Router";
import db from "./lib/db";

dotenv.config();

const router = new Router();
router.init();

db.init();
console.log("hot reloading!")
import user from './lib/User'

user.create("nome", "cognome", "prova@prova.com", "prova", new Date());