import express from "express";
import cors from "cors";

import playwrightRoutes from "./routes/playwright.routes";

const app = express();

app.use(cors());

app.use(express.json());

app.use("/api/playwright", playwrightRoutes);

app.get("/", (_, res) => {

    res.json({
        success: true
    });

});

export default app;