import {Router} from 'express';
import { PostController } from './post.controller';
import authGurd from '../../middlewares/authGurd';
import { upload } from '../../middlewares/upload';
const router = Router();

// Define your routes here
router.post('/', authGurd, upload.single('thumbnail'), PostController.createPost);
router.get('/',   PostController.getAllPosts);
router.get('/:id', PostController.getPostById);
router.patch('/:id', authGurd, upload.single('thumbnail'), PostController.updatePost);
router.delete('/:id', authGurd, PostController.deletePost);






export const postRouter = router;