
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";

import authRoutes from "./routes/auth.routes";
import clubRoutes from "./routes/club.routes";
import teamRoutes from "./routes/team.routes";
import playerRoutes from "./routes/player.routes";
import ContractRoutes from "./routes/contract.routes";
import loanRoutes from "./routes/loan.routes";
import transferRoutes from "./routes/transfer.routes";
import adminRoutes from "./routes/admin.routes";



const app = express();
app.use(express.json());

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
  ],
  credentials: true,
}));
app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/players", playerRoutes);
app.use("/api/contracts", ContractRoutes);
app.use("/api/loans", loanRoutes);
app.use("/transfers", transferRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api/uploads", express.static(path.join(__dirname, "..", "uploads")));


app.use(helmet());

app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});


export default app;
