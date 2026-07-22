import express from "express";
import governmentSchemeController from "./governmentScheme.controller.js";

const router = express.Router();

// ==========================================
// SCHEMES
// ==========================================

// GET ALL SCHEMES
router.get(
  "/",
  governmentSchemeController.getAll
);

// GET CATEGORIES
router.get(
  "/categories",
  governmentSchemeController.getCategories
);

// GET STATES
router.get(
  "/states",
  governmentSchemeController.getStates
);

// SEARCH
router.get(
  "/search",
  governmentSchemeController.search
);

// GET SINGLE SCHEME
router.get(
  "/:id",
  governmentSchemeController.getById
);

// CREATE
router.post(
  "/",
  governmentSchemeController.create
);

// UPDATE
router.put(
  "/:id",
  governmentSchemeController.update
);

// DELETE
router.delete(
  "/:id",
  governmentSchemeController.delete
);

// MANUAL SYNC
router.post(
  "/sync",
  governmentSchemeController.syncSchemes
);

export default router;