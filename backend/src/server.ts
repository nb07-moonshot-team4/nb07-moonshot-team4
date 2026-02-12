import express from 'express';
import dotenv from 'dotenv';
import commentRoutes from "./features/comment/comment-routes.js";
import authRoutes from "./features/auth/auth-routes.js";
import taskRoutes from "./features/task/task-routes.js";
import { errorHandler } from "./error/error-handler.js";
import memberRoutes from "./features/member/member-routes.js";
import userRoutes from './features/user/user-routes.js'
import projectRoutes from './features/project/project-routes.js'
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("서버 작동중 ......");
});

app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/members", memberRoutes);
app.use('/users', userRoutes);
app.use("/projects", projectRoutes);

app.listen(PORT, () => {
  console.log(`서버 시작 중 ... : http://localhost:${PORT}`);
});


app.use(errorHandler);

export default app;