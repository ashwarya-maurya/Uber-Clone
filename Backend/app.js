const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const app = express();
const cors = require('cors');
const cookies = require('cookie-parser');
const connectToDB = require('./DB/db');

const userRouter = require('./routes/user.routes');
const captainRouter = require('./routes/captain.routes');
const mapRouter = require('./routes/map.routes');
const rideRouter = require('./routes/ride.routes');

connectToDB();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/users', userRouter);
app.use('/captains', captainRouter);
app.use('/maps', mapRouter);
app.use('/rides', rideRouter);

module.exports = app;
