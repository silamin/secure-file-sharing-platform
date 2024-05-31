const crypto = require('crypto');
require('dotenv').config();

const encrypt = (buffer) => {
    const iv = crypto.randomBytes(16);
    const key = crypto.createHash('sha256').update(String(process.env.SECRET_KEY)).digest('base64').substr(0, 32);
    const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
    const encrypted = Buffer.concat([iv, cipher.update(buffer), cipher.final()]);
    return encrypted;
};

const decrypt = (buffer) => {
    const iv = buffer.slice(0, 16);
    const encryptedText = buffer.slice(16);
    const key = crypto.createHash('sha256').update(String(process.env.SECRET_KEY)).digest('base64').substr(0, 32);
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted;
};

module.exports = { encrypt, decrypt };
