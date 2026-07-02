import { Request, Response } from "express";
import { PlaywrightService } from "../services/playwright.service";

const playwright = new PlaywrightService();

export const startRecording = (
  req: Request,
  res: Response
) => {
  playwright.startRecording();

  res.json({
    success: true,
  });
};

export const runTest = (
  req: Request,
  res: Response
) => {
  const { name, slowMo } = req.body;

  playwright.runTest(name, slowMo);

  res.json({
    success: true,
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



