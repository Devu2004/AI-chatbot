const express = require('express')
const cookieparser = require('cookie-parser')
const authRoutes = require('./routes/auth.routes')
const cors = require('cors')

const app = express()
app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true 
}));
app.use(express.json())
app.use(cookieparser())

app.use('/api/auth',authRoutes)

module.exports = app