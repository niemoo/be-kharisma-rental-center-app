const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');

const app = express();
const port = 3001;
const appRoutes = require('./src/routes/route-lib.js');

const fileStorage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'public/images');
  },
  filename: (req, file, callback) => {
    callback(null, new Date().toString() + '-' + file.originalname);
  },
});

const fileFilter = (req, file, callback) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    callback(null, true);
  } else {
    callback(null, false);
  }
};

app.use(bodyParser.json());
app.use(cors());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image'));
app.use('/', appRoutes);

app.listen(port, () => {
  console.log(`listening on ${port}`);
});
