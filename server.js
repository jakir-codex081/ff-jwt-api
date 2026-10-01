const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// ১. Root Endpoint (সার্ভার ঠিকঠাক চলছে কিনা চেক করার জন্য)
app.get('/', (req, res) => {
    res.send('Free Fire JWT Generator API is running!');
});

// ২. Access Token / Authorization Code থেকে JWT নেওয়ার এন্ডপয়েন্ট
app.post('/api/get-jwt-token', async (req, res) => {
    const { token_or_code, platform } = req.body;

    if (!token_or_code) {
        return res.status(400).json({ success: false, message: 'Token or Code is required' });
    }

    try {
        // Garena Official OAuth Exchange Endpoint
        const response = await axios.post('https://api.ff.garena.co.id/auth/auth/login_n', {
            access_token: token_or_code,
            platform: parseInt(platform || 8), // Default 8 (Gmail)
            app_id: 100067
        }, {
            headers: {
                'User-Agent': 'FreeFire/1.100.1 (Android; Google)',
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            data: response.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.response ? error.response.data : error.message
        });
    }
});

// ৩. Guest Account (UID & Password) দিয়ে JWT Token তৈরি
app.post('/api/guest-jwt', async (req, res) => {
    const { uid, password } = req.body;

    if (!uid || !password) {
        return res.status(400).json({ success: false, message: 'UID and Password required' });
    }

    try {
        // Guest Authentication Endpoint
        const response = await axios.post('https://api.ff.garena.co.id/auth/guest/login', {
            uid: uid,
            password: password,
            app_id: 100067
        }, {
            headers: {
                'User-Agent': 'FreeFire/1.100.1 (Android; Google)',
                'Content-Type': 'application/json'
            }
        });

        res.json({
            success: true,
            jwt_token: response.data.token || response.data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.response ? error.response.data : error.message
        });
    }
});

// Port configuration for Hosting Services (Render/Railway automatically assigns process.env.PORT)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
           
