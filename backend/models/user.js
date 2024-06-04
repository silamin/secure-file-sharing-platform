const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    totpSecret: {
        type: String,
        default: ''
    },
    uploadedFiles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }],
    downloadedFiles: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }]
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

const User = mongoose.model('User', userSchema);

module.exports = User;
