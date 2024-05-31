const speakeasy = require('speakeasy');
const qrcode = require('qrcode');
const User = require('../models/user');

exports.enableMfa = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send('User not found');

    const secret = speakeasy.generateSecret({ length: 20 });
    user.totpSecret = secret.base32;
    await user.save();

    qrcode.toDataURL(secret.otpauth_url, (err, dataUrl) => {
        if (err) return res.status(500).send('Error generating QR code');
        res.json({ dataUrl });
    });
};

exports.verifyMfa = async (req, res) => {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).send('User not found');

    const verified = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: req.body.token,
    });

    if (verified) {
        res.status(200).send('MFA verified');
    } else {
        res.status(400).send('Invalid token');
    }
};
