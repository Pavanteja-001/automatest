import { Router } from "express";
import {
  startRecording,
  runTest,
  getGeneratedCode,
  saveTest,
  getTests,
  loadTest,
} from "../controllers/playwright.controller";

const router = Router();

router.post("/start", startRecording);

router.post("/run", runTest);

router.get("/code", getGeneratedCode);

router.post("/save", saveTest);

router.get("/tests", getTests);

router.get("/tests/:name", loadTest);

export default router;