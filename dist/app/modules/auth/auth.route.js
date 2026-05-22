import { Router } from 'express';
import { authController } from './auth.controller';
const router = Router();
// Define your routes here
router.post('/register', authController.Register);
router.post('/login', authController.Login);
export const authRouter = router;
