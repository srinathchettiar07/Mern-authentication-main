import { Router } from "express";
import { checkAuth, login, logout, requestVerification , signup ,updateProfile } from "../controllers/auth.controller.js";
import { ensureAuthenticated } from "../middleware/authenticate.js";
const router = Router();

router.post("/signup" , signup);
router.post("/verify" , requestVerification)
router.post("/login" , login)
router.post("/logout" , logout)
router.post("/update-profile" , ensureAuthenticated , updateProfile)
router.get("/check" , ensureAuthenticated , checkAuth)


export default router;

