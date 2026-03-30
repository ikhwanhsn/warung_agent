import express from "express";

/**
 * Express router that answers every method/path with 501 (stub checkout).
 * @param {string} moduleName
 * @returns {import("express").Router}
 */
export function stubRouter(moduleName) {
  const r = express.Router();
  // Express 5 / path-to-regexp: avoid("*") — use pathless middleware.
  r.use((req, res) => {
    res.status(501).json({
      success: false,
      error: "This route module is not implemented in this repository checkout.",
      module: moduleName,
      method: req.method,
      path: req.originalUrl || req.path,
    });
  });
  return r;
}
