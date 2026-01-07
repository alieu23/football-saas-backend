import { Sequelize } from "sequelize-typescript";
import dotenv from "dotenv";

import { Club } from "../models/Club";
import { User } from "../models/User";
import { Team } from "../models/Team";
import { Player } from "../models/Player";
import { PlayerContract } from "../models/PlayerContract";
import { PlayerLoan } from "../models/PlayerLoan";
import { PlayerTransfer } from "../models/PlayerTransfer";

dotenv.config();

export const sequelize = new Sequelize({
  dialect: "postgres",
   host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || "football_saas_db",
  username: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "alieu123",
  logging: (process.env.DB_LOGGING || "false") === "true" ? console.log : false,
  models: [
    Club,
    User,
    Team,
    Player,
    PlayerContract,
    PlayerLoan,
    PlayerTransfer
  ]
});
