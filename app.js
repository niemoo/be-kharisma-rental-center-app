const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const appRoutes = require('./src/routes/route-lib.js');

const app = express();
dotenv.config();

app.use(cookieParser());
app.use(bodyParser.json());
app.use(
  cors({
    origin: 'http://localhost:3000', // Ganti dengan daftar origin yang diizinkan jika perlu
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Atur metode yang diizinkan
    allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept', 'Authorization'], // Atur header yang diizinkan
    credentials: true, // Izinkan pengiriman cookie melalui CORS
  })
);
app.use(express.static('public/cars'));
app.use('/', appRoutes);

app.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`);
});
