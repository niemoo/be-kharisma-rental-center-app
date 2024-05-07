const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 3001;
const appRoutes = require('./src/routes/route-lib.js');

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public/cars'));
app.use('/', appRoutes);

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
