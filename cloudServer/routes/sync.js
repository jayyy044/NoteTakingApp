// cloudServer/routes/sync.js - TEMPORARY PLACEHOLDER
const express = require('express');
const router = express.Router();

// A simple test endpoint
router.get('/test', (req, res) => {
    res.json({ message: 'Sync route is working!' });
});

module.exports = router;