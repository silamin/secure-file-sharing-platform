const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    uploadDate: {
        type: Date,
        default: Date.now
    },
    downloadCount: {
        type: Number,
        default: 0
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'private'
    },
    data: {
        type: Buffer, 
        required: true
    },
    version: { type: Number, default: 1 },
    previousVersions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }],
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

module.exports = mongoose.model('File', fileSchema);
