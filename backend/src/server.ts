import express from 'express';
import dotenv from 'dotenv';
import { errorHandler } from "./error/error-handler.js";
import memberRoutes from "./member/member-router.js";
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// middleware
app.use(express.json());
app.use(memberRoutes);

// health check
app.get('/', (req, res) => {
  res.send('🚀 Moonshot backend is running');
});

// server start
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});

app.use(errorHandler);

export default app;