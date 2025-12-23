const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Routes Imports
const authRoutes = require('./routes/authRoutes');
const houseRoutes = require('./routes/houseRoutes');
const roomRoutes = require('./routes/roomRoutes');
const formRoutes = require('./routes/formRoutes');

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
        process.env.FRONTEND_URL // Allow production frontend
    ].filter(Boolean), // Remove undefined if env var not set
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// app.options('*', cors()); // Removed to fix PathError in newer Express versions
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
const DB = process.env.DATABASE.replace(
    '<db_password>',
    process.env.DATABASE_PASSWORD
);

mongoose.connect(DB)
    .then(() => {
        console.log('Connected to DB successfully');
    })
    .catch((err) => {
        console.log('Failed to connect to DB:', err);
    });

// Basic Route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/houses', houseRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/forms', formRoutes);

// Start Server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});
