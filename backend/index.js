const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const mfaRoutes = require('./routes/mfaRoutes');
const errorMiddleware = require('./middlewares/errorMiddleware');
const cookieParser = require('cookie-parser');

require('dotenv').config();

const app = express();

app.use(cors({
    origin: 'http://localhost:3000', 
    credentials: true
}));
connectDB();

app.use(express.json());
app.use(cookieParser());


app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/mfa', mfaRoutes);

app.use(errorMiddleware);

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
