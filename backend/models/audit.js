const mongoose = require('mongoose');

const auditSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
        required: false
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const Audit = mongoose.model('Audit', auditSchema);

module.exports = Audit;
