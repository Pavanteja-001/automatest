import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import playwrightRoutes from "./routes/playwright.routes";
import userAuthRoutes from "./modules/auth/user-auth.routes";
import { requireAuth } from "./modules/auth/auth.middleware";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}));

app.use(express.json());

app.use(cookieParser());

app.use("/api/auth", userAuthRoutes);

app.use("/api/playwright", requireAuth, playwrightRoutes);

app.get("/", (_, res) => {

    res.json({
        success: true
    });

});

export default app;