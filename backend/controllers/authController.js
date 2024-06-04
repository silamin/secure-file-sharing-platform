const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;


exports.register = async (req, res) => {
    try {
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(400).send('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new User({ username: req.body.username, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.cookie('token', token, { httpOnly: true, secure: true });

        res.status(201).send('User created and logged in');
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send('Internal server error');
    }
};

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).json({ message: 'Invalid username or password' });
        }

        const mfaEnabled = user.totpSecret !== '';

        if (!mfaEnabled) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', token, { httpOnly: true, secure: true });
            return res.status(200).json({ message: 'Login successful' });
        }
        res.status(200).json({ message: 'Login successful', userId: user._id });
    } catch (error) {
        console.error('Error logging in user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};



exports.logout = (req, res) => {
    res.cookie('token', '', { httpOnly: true, secure: true, expires: new Date(0) });
    res.status(200).send('Logout successful');
};

exports.verifyToken = async (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).send('Unauthorized');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return res.status(401).send('Unauthorized');
        }
        res.status(200).send('User is authorized');
    } catch (error) {
        console.error('Error verifying token:', error);
        res.status(401).send('Unauthorized');
    }
};