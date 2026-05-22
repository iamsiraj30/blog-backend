import express, { Application, Request, Response } from 'express';
import cors from "cors"
import path from 'path';
import { postRouter } from './app/modules/post/post.route';
import { authRouter } from './app/modules/auth/auth.route';
import { userRouter } from './app/modules/user/user.route';
import { commentRouter } from './app/modules/comment/comment.route';
import { errorHandler } from './app/middlewares/error';

const app:Application = express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));


app.use("/api/v1/post", postRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/comment", commentRouter)

app.get('/', (req:Request, res:Response) => {
  res.send('Hello, World!');
});

app.use(errorHandler);


export default app;