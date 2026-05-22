import { Router } from 'express';
import { UserController } from './user.controller';
import authGurd from '../../middlewares/authGurd';
import { upload } from '../../middlewares/upload';

const router = Router();

router.get('/profile', authGurd, UserController.getProfile);
router.patch('/profile', authGurd, upload.single('profileImage'), UserController.updateProfile);

export const userRouter = router;
