const mongoose = require('mongoose');
require('dotenv').config();

function connectDB() {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('MongoDB connected'))
        .catch(err => {
            console.error('Failed to connect to MongoDB', err);
            process.exit(1);
        });

};

module.exports = connectDB;

