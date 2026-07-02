import { Request, Response } from "express";
import { PlaywrightService } from "../services/playwright.service";

const playwright = new PlaywrightService();

export const startRecording = (
  req: Request,
  res: Response
) => {
  const { autoLogin } = req.body;

  playwright.startRecording(Boolean(autoLogin));

  res.json({
    success: true,
  });
};

export const runTest = (
  req: Request,
  res: Response
) => {
  const { name, slowMo, headed, autoLogin } = req.body;

  playwright.runTest(name, slowMo, Boolean(headed), Boolean(autoLogin));

  res.json({
    success: true,
  });
};

export const stopTest = (
  req: Request,
  res: Response
) => {
  playwright.stopTest();

  res.json({
    success: true,
  });
};

export const getStatus = (
  req: Request,
  res: Response
) => {
  res.json({
    success: true,
    running: playwright.isRunning(),
  });
};

export const getGeneratedCode = (
  req: Request,
  res: Response
) => {
  res.json({
    success: true,
    code: playwright.getGeneratedCode(),
  });
};

export const saveTest = (
  req: Request,
  res: Response
) => {
  const { name, code } = req.body;

  if (!name || !code) {
    return res.status(400).json({
      success: false,
      message: "Name and code are required.",
    });
  }

  playwright.saveTest(name, code);

  res.json({
    success: true,
  });
};

export const getTests = (
  req: Request,
  res: Response
) => {
  const tests = playwright.getAllTests();

  res.json({
    success: true,
    tests,
  });
};

export const loadTest = (
  req: Request,
  res: Response
) => {
  const name = String(req.params.name);

  try {
    const code = playwright.loadTest(name);

    res.json({
      success: true,
      code,
    });
  } catch {
    res.status(404).json({
      success: false,
      message: "Test not found.",
    });
  }
};



