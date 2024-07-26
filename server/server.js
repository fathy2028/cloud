import express from 'express';
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import conn from './config/db.js';
import authroutes from './routes/authroute.js';
import categoryroute from './routes/categoryroute.js';
import productroute from './routes/productroute.js';
import orderroute from './routes/orderroute.js';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
conn();

// Middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(cors({ origin: 'https://cloud-pharmacy.vercel.app' })); // Allow requests from your frontend

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/v1/auth', authroutes);
app.use('/api/v1/category', categoryroute);
app.use('/api/v1/product', productroute);
app.use('/api/v1/order', orderroute);

app.get('/', (req, res) => {
  res.send({
    message: 'Welcome to cloud pharmacy',
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.DEV_MODE} mode on port ${PORT}`.green);
});
