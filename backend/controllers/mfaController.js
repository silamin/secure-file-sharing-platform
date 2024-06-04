const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
require('dotenv').config();
const JWT_SECRET = process.env.JWT_SECRET;

exports.enableMfa = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).send('User not found');

        const secret = speakeasy.generateSecret({ length: 20 });
        user.totpSecret = secret.base32;
        console.log('Generated Secret:', user.totpSecret); // Debugging log
        await user.save();

        qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
            if (err) return res.status(500).send('Error generating QR code');
            res.json({ dataUrl });
        });
    } catch (error) {
        console.error('Error enabling MFA:', error);
        res.status(500).send('Server error');
    }
};

exports.verifyMfa = async (req, res) => {
    try {
        const { token, userId } = req.body;
        console.log('UserId:', userId); // Log userId
        console.log('Token:', token); // Log token

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.totpSecret,
            encoding: 'base32',
            token: token,
            window: 2 // Increase window size to allow for more time drift
        });

        if (verified) {
            const newToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });
            res.cookie('token', newToken, { httpOnly: true, secure: true });
            res.status(200).json({ message: 'MFA verified' });
        } else {
            res.status(400).json({ message: 'Invalid token' });
        }
    } catch (error) {
        console.error('Error verifying MFA:', error);
        res.status(500).json({ message: 'Server error' });
    }
};



exports.disableMfa = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).send('User not found');

        user.totpSecret = '';
        await user.save();

        res.status(200).send('MFA disabled');
    } catch (error) {
        console.error('Error disabling MFA:', error);
        res.status(500).send('Server error');
    }
};

exports.checkMfa = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).send('User not found');

        const mfaEnabled = user.totpSecret !== '' ? true : false;

        res.status(200).json({ mfaEnabled });
    } catch (error) {
        console.error('Error checking MFA:', error);
        res.status(500).send('Server error');
    }
};