'use strict'
import * as dotenv from "dotenv";
import Router from "./lib/Router";
import db from "./lib/db";

dotenv.config();

const router = new Router();
router.init();

db.init();
console.log("hot reloading!")
