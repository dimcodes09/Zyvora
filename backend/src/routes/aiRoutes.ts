import { Router } from "express";
import { aiSearch } from "../controllers/aiController.js";
import { getSuggestions } from "../controllers/suggestionController.js";

const router: Router = Router();

// 🔥 MAIN AI SEARCH — delegates to aiController (sophisticated search + ranking)
router.post("/search", aiSearch);

// 🔥 SUGGESTIONS
router.get("/suggestions", getSuggestions);

export default router;