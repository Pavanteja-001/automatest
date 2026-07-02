import { Router } from "express";
import {
  startRecording,
  runTest,
  getGeneratedCode,
  saveTest,
  getTests,
  loadTest,
} from "../controllers/playwright.controller";
import {
  getFileTree,
  createFolder,
  createFile,
  readFile,
  updateFile,
  deleteNode,
} from "../controllers/filesystem.controller";

const router = Router();

router.post("/start", startRecording);

router.post("/run", runTest);

router.get("/code", getGeneratedCode);

router.post("/save", saveTest);

router.get("/tests", getTests);

router.get("/tests/:name", loadTest);

router.get("/fs/tree", getFileTree);

router.post("/fs/folder", createFolder);

router.post("/fs/file", createFile);

router.get("/fs/file", readFile);

router.put("/fs/file", updateFile);

router.delete("/fs/node", deleteNode);

export default router;