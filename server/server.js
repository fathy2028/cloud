import express from 'express';
import cors from 'cors';
import colors from 'colors';
import dotenv from 'dotenv';
import morgan from 'morgan';
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

// Middleware
app.use(express.json());
app.use(morgan('dev'));

// Configure CORS
const corsOptions = {
  origin: 'https://cloud-pharmacy.vercel.app', // frontend origin
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true, // allow cookies
  optionsSuccessStatus: 204,
  allowedHeaders: 'Content-Type,Authorization',
};

app.use(cors(corsOptions));

// Ensure CORS middleware is applied before routes
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://cloud-pharmacy.vercel.app");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

conn();

// Routes
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/v1/auth', authroutes);
app.use('/api/v1/category', categoryroute);
app.use('/api/v1/product', productroute);
app.use('/api/v1/order', orderroute);

app.get('/', (req, res) => {
  res.send({
    message: 'Welcome to Cloud Pharmacy',
  });
});

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server running on ${process.env.DEV_MODE} mode on port ${PORT}`.green);
});
