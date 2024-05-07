const { v4: uuidv4 } = require('uuid');
const db = require('../configs/database.js');
const response = require('../configs/response.js');

module.exports = {
  addRolesData: (req, res) => {
    const { name } = req.body;
    const sql = 'insert into roles (id, name, created_at, updated_at) values (?, ?, ?, ?)';

    if (!name) {
      response(400, '', 'Error: Name is required', res);
      return res.status(400).send({ error: 'Name is required.' });
    }

    db.query(sql, [uuidv4(), name, new Date().toISOString(), new Date().toISOString()], (err, result) => {
      if (err) {
        response(500, err, err.message, res);
      }

      response(201, result, 'Successfully added roles', res);
    });
  },
  addCarsData: (req, res) => {
    const { name, transmission, price_12, price_24, price_fullday } = req.body;
    // const { image } = req.file.filename;
    const sql = 'insert into cars (name, transmission, image, price_12, price_24, price_fullday, created_at, modified_at) values (?, ?, ?, ?, ?, ?, ?, ?)';

    if (!req.file) {
      const err = new Error('Image Harus di Upload');
      err.errorStatus = 422;
      throw err;
    }

    db.query(sql, [name, transmission, req.file.filename, price_12, price_24, price_fullday, new Date().toISOString(), new Date().toISOString()], (err, result) => {
      if (err) {
        response(500, err, err.message, res);
      }

      response(201, result, 'Successfully added cars data', res);
    });

    // res.send(image);
  },
  getCarsData: (req, res) => {
    const sql = 'select * from cars';

    db.query(sql, (err, result) => {
      if (err) {
        response(500, err, err.message, res);
      }

      response(200, result, 'Successfully get cars data', res);
    });
  },
  editCarsData: (req, res) => {
    const { id, name, transmission, price_12, price_24, price_fullday } = req.body;
    const { image1, image2 } = req.file.path;
    const sql = 'update cars set name = ?, transmission = ?, image = ?, price_12 = ?, price_24 = ?, price_fullday = ?, modified_at = ? where id = ?';

    db.query(sql, [name, transmission, image1, image2, price_12, price_24, price_fullday, new Date().toISOString(), id], (err, result) => {
      if (err) {
        response(500, err, err.message, res);
      }

      response(200, result, 'Successfully update cars data', res);
    });
  },
};
