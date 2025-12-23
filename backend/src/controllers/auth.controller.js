const usermodel = require('../models/auth.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

async function registeruser(req, res) {
    try {
        const { email, username, password } = req.body;
        const isuseralreadyexist = await usermodel.findOne({ email });

        if (isuseralreadyexist) {
            return res.status(400).json({ message: 'User already exists!' });
        }

        const hashpassword = await bcrypt.hash(password, 10);
        const user = await usermodel.create({
            email,
            username,
            password: hashpassword,
        });

        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true });

        res.status(201).json({
            message: 'User Registered successfully',
            user: { username: user.username, email: user.email, _id: user._id }
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

async function loginuser(req, res) {
    try {
        const { email, password } = req.body;
        const user = await usermodel.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).json({ message: 'Invalid Credentials!' });
        }

        const token = generateToken(user._id);
        res.cookie('token', token, { httpOnly: true });

        res.status(200).json({
            message: 'User logged in successfully!',
            user: { email: user.email, username: user.username, _id: user._id }
        });
    } catch (error) {
        res.status(500).json({ message: "Server Error", error: error.message });
    }
}

module.exports = { registeruser, loginuser };