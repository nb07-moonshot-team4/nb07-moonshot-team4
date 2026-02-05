import express from 'express';
import dotenv from 'dotenv';
import taskRouter from './features/task/task.router.js';
dotenv.config();
const app = express();
const PORT = Number(process.env.PORT) || 3000;
app.use(express.json());
app.get('/', (req, res) => {
    res.send('서버 작동중 ......');
});
app.use('/api', taskRouter);
app.listen(PORT, () => {
    console.log(`서버 시작 중 ... : http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map