import jwt from 'jsonwebtoken';
import 'dotenv/config';

const token = jwt.sign(
  { userId: 1 },
  process.env.JWT_SECRET!,
  { expiresIn: '1h' }
);

console.log('🔑 TEST TOKEN:\n', token);