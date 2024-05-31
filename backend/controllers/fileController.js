const File = require('../models/file');
const User = require('../models/user');
const Audit = require('../models/audit');
const { encrypt, decrypt } = require('../utils/encryption');
const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const signJwt = promisify(jwt.sign);

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }
        const { originalname, mimetype, buffer } = req.file;
        const { title, description, accessPermission } = req.body;
        const existingFile = await File.findOne({ name: originalname, uploader: req.user._id });

        if (existingFile) {
            const newVersion = new File({
                name: originalname,
                data: encrypt(buffer),
                uploader: req.user._id,
                description: description || existingFile.description,
                visibility: accessPermission || existingFile.visibility,
                version: existingFile.version + 1,
                previousVersions: [...existingFile.previousVersions, existingFile._id],
            });
            await newVersion.save();
            existingFile.latestVersion = newVersion._id;
            await existingFile.save();

            req.user.uploadedFiles.push(newVersion._id);
            await req.user.save();

            await new Audit({ userId: req.user._id, action: 'upload new version', fileId: newVersion._id }).save();
            res.status(201).send('New version uploaded');
        } else {
            const newFile = new File({
                name: originalname,
                data: encrypt(req.file.buffer),
                uploader: req.user._id,
                title: title || originalname,
                description: description || '',
                visibility: accessPermission || 'private',
            });
            await newFile.save();

            req.user.uploadedFiles.push(newFile._id);
            await req.user.save();

            await new Audit({ userId: req.user._id, action: 'upload', fileId: newFile._id }).save();
            res.status(201).send('File uploaded');
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.listFiles = async (req, res) => {
    try {
        const files = await File.find({ visibility: 'public' });

        const filesWithSize = files.map(file => {
            const fileObject = file.toObject();
            fileObject.size = file.data.length;
            return fileObject;
        });

        res.json(filesWithSize);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.listUploadedFiles = async (req, res) => {
    try {
        const uploadedFiles = await File.find({ uploader: req.user._id });
        res.json(uploadedFiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.listDownloadedFiles = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('downloadedFiles');

        if (!user) {
            return res.status(404).send('User not found');
        }
        const downloadedFiles = user.downloadedFiles.map(file => {
            const fileObject = file.toObject();
            fileObject.size = file.data.length;
            return fileObject;
        });
        res.json(downloadedFiles);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.downloadFile = async (req, res) => {
    try {
        const file = await File.findById(req.params.id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        const token = req.cookies.token;
        let decoded = null;

        if (token) {
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = await User.findById(decoded.userId);
            } catch (error) {
                console.log('Error decoding token:', error);
                return res.status(401).json({ error: 'Invalid token' });
            }
        }

        if (file.visibility === 'private') {
            console.log('File is private');

            if (!token) {
                return res.status(401).json({ error: 'Authentication token is missing' });
            }

            if (!req.user) {
                return res.status(401).json({ error: 'Invalid token' });
            }

            if (!file.uploader.equals(req.user._id)) {
                return res.status(403).send('Access denied');
            }

            await new Audit({ userId: req.user._id, action: `downloaded private file ${file.name}`, fileId: file._id }).save();
        } else {
            if (req.user) {
                if (!req.user.downloadedFiles.includes(file._id)) {
                    req.user.downloadedFiles.push(file._id);
                    await req.user.save();
                }
            }

            file.downloadCount += 1;
            await file.save();
        }
        const decryptedFile = decrypt(file.data);

        res.set({
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${file.name}"`,
        });
        res.send(decryptedFile);
    } catch (error) {
        console.error('Error downloading file:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Invalid token' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.updateFile = async (req, res) => {
    try {
        const { id } = req.params;
        const { description, name, visibility } = req.body;

        const file = await File.findById(id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        if (req.user._id.toString() !== file.uploader.toString()) {
            return res.status(403).send('You are not authorized to update this file');
        }

        file.description = description || file.description;
        file.name = name || file.name;
        file.visibility = visibility || file.visibility;

        await file.save();
        res.status(200).json(file);
    } catch (error) {
        console.error('Error updating file:', error);
        res.status(500).send('Internal server error');
    }
};

exports.deleteFile = async (req, res) => {
    try {
        const { id } = req.params;

        const file = await File.findById(id);
        if (!file) {
            return res.status(404).send('File not found');
        }

        if (req.user._id.toString() !== file.uploader.toString()) {
            return res.status(403).send('You are not authorized to delete this file');
        }

        await User.updateOne(
            { _id: file.uploader },
            { $pull: { uploadedFiles: file._id } }
        );

        await File.deleteOne({ _id: id });
        res.status(200).send('File deleted successfully');
    } catch (error) {
        console.error('Error deleting file:', error);
        res.status(500).send('Internal server error');
    }
};

