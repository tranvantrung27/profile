require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/profile-stats')
    .then(() => console.log('Đã kết nối với MongoDB'))
    .catch((err) => console.error('Lỗi kết nối MongoDB:', err));

// Schema cho thống kê
const StatsSchema = new mongoose.Schema({
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 }
}, { timestamps: true });

const Stats = mongoose.model('Stats', StatsSchema);

// API Routes
// Lấy thống kê
app.get('/api/stats', async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) {
            stats = await Stats.create({ views: 0, likes: 0 });
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tăng lượt xem
app.post('/api/views', async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) {
            stats = await Stats.create({ views: 1, likes: 0 });
        } else {
            stats.views += 1;
            await stats.save();
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Tăng lượt thích
app.post('/api/likes', async (req, res) => {
    try {
        let stats = await Stats.findOne();
        if (!stats) {
            stats = await Stats.create({ views: 0, likes: 1 });
        } else {
            stats.likes += 1;
            await stats.save();
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server đang chạy tại http://localhost:${PORT}`);
});