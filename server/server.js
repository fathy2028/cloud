import express from "express";
import colors from "colors";
import dotenv from "dotenv";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import conn from "./config/db.js";
import authroutes from "./routes/authroute.js";
import categoryroute from "./routes/categoryroute.js";
import productroute from "./routes/productroute.js";
import orderroute from "./routes/orderroute.js";

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Connect to the database
conn();

// Middleware
app.use(express.json());
app.use(morgan("dev"));

// CORS Configuration
app.use(cors({
    origin: 'https://cloud-pharmacy.vercel.app',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
}));

// Handle preflight requests
app.options('*', cors({
    origin: 'https://cloud-pharmacy.vercel.app',
    methods: 'GET,POST,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type,Authorization'
}));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/v1/auth", authroutes);
app.use("/api/v1/category", categoryroute);
app.use("/api/v1/product", productroute);
app.use("/api/v1/order", orderroute);

// Home route
app.get("/", (req, res) => {
    res.send({
        message: "welcome to cloud pharmacy"
    });
});

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`server running on ${process.env.DEV_MODE} mode on port ${PORT}`.green);
});
