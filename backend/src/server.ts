import express from "express";
import dotenv from "dotenv";
import commentRoutes from "./features/comment/comment-routes.js";
import authRoutes from "./features/auth/auth-routes.js";
import taskRoutes from "./features/task/task-routes.js";
import { errorHandler } from "./error/error-handler.js";
import memberRoutes from "./features/member/member-routes.js";
import userRoutes from "./features/user/user-routes.js";
import projectRoutes from "./features/project/project-routes.js";
import cors from "cors";
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const allowedOrigins = [
  'http://localhost:3000', 
  'https://nb07-moonshot-team4.vercel.app', // 
  'https://nb07-moonshot-team4-x6qn.onrender.com' 
];

app.use(express.json());


app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.get("/", (req, res) => {
  res.send("서버 작동중 ......");
});

app.use("/api/auth", authRoutes);
app.use("/api", commentRoutes);
app.use("/api", taskRoutes);
app.use("/api", memberRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

app.listen(PORT, () => {
  console.log(`서버 시작 중 ... : http://localhost:${PORT}`);
});

app.use(errorHandler);

export default app;
