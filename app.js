const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const appRoutes = require('./src/routes/route-lib.js');

const app = express();
dotenv.config();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public/cars'));
app.use('/', appRoutes);

app.listen(process.env.PORT, () => {
  console.log(`listening on ${process.env.PORT}`);
});
