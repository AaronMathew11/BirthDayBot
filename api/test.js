module.exports = (req, res) => {
    res.status(200).json({ 
        message: 'Test function working',
        method: req.method,
        url: req.url,
        timestamp: new Date().toISOString()
    });
};