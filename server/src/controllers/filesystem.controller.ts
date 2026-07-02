import { Request, Response } from "express";
import { FilesystemService } from "../services/filesystem.service";

const filesystem = new FilesystemService();

export const getFileTree = (
  req: Request,
  res: Response
) => {
  res.json({
    success: true,
    tree: filesystem.getTree(),
  });
};

export const createFolder = (
  req: Request,
  res: Response
) => {
  const { path: folderPath } = req.body;

  if (!folderPath) {
    return res.status(400).json({
      success: false,
      message: "Path is required.",
    });
  }

  try {
    filesystem.createFolder(folderPath);

    res.json({
      success: true,
    });
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid path.",
    });
  }
};

export const createFile = (
  req: Request,
  res: Response
) => {
  const { path: filePath } = req.body;

  if (!filePath) {
    return res.status(400).json({
      success: false,
      message: "Path is required.",
    });
  }

  try {
    filesystem.createFile(filePath);

    res.json({
      success: true,
    });
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid path or file already exists.",
    });
  }
};

export const readFile = (
  req: Request,
  res: Response
) => {
  const filePath = String(req.query.path ?? "");

  try {
    const code = filesystem.readFile(filePath);

    res.json({
      success: true,
      code,
    });
  } catch {
    res.status(404).json({
      success: false,
      message: "File not found.",
    });
  }
};

export const updateFile = (
  req: Request,
  res: Response
) => {
  const { path: filePath, code } = req.body;

  if (!filePath || typeof code !== "string") {
    return res.status(400).json({
      success: false,
      message: "Path and code are required.",
    });
  }

  try {
    filesystem.writeFile(filePath, code);

    res.json({
      success: true,
    });
  } catch {
    res.status(400).json({
      success: false,
      message: "Invalid path.",
    });
  }
};

export const deleteNode = (
  req: Request,
  res: Response
) => {
  const nodePath = String(req.query.path ?? "");

  if (!nodePath) {
    return res.status(400).json({
      success: false,
      message: "Path is required.",
    });
  }

  try {
    filesystem.deleteNode(nodePath);

    res.json({
      success: true,
    });
  } catch {
    res.status(400).json({
      success: false,
      message: "Unable to delete path.",
    });
  }
};
