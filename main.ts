'use strict'
import * as dotenv from "dotenv";
import Router from "./lib/Router";
import db from "./lib/db";
import MQTTClient from "./lib/MQTTClient";
import initTables from './migrations/tables';
import { scheduleJobs } from "./lib/jobs";

dotenv.config();

const router = new Router();
router.init();

const mqtt_client = new MQTTClient();
mqtt_client.init();

scheduleJobs();

db.init();
console.log("hot reloading!")
initTables().then(async _ => {
    console.log("create tabelle");
  //  await user.create("nome", "cognome", "prova@prova.com", "prova", new Date())
    console.log("fatto")
});
