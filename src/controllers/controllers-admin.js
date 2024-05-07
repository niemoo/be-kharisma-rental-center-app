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

    // Ambil data lama dari database
    db.query('SELECT * FROM cars WHERE id = ?', [id], (err, rows) => {
      if (err) {
        response(500, err, err.message, res);
        return;
      }

      if (rows.length === 0) {
        response(404, null, 'Car data not found', res);
        return;
      }

      // Gabungkan data lama dengan data baru
      const oldData = rows[0];
      const newData = {
        name: name || oldData.name,
        transmission: transmission || oldData.transmission,
        image: req.file ? req.file.filename : oldData.image,
        price_12: price_12 || oldData.price_12,
        price_24: price_24 || oldData.price_24,
        price_fullday: price_fullday || oldData.price_fullday,
        modified_at: new Date().toISOString(),
      };

      // Lakukan pembaruan di database
      const sql = 'UPDATE cars SET name = ?, transmission = ?, image = ?, price_12 = ?, price_24 = ?, price_fullday = ?, modified_at = ? WHERE id = ?';
      const values = [newData.name, newData.transmission, newData.image, newData.price_12, newData.price_24, newData.price_fullday, newData.modified_at, id];

      db.query(sql, values, (err, result) => {
        if (err) {
          response(500, err, err.message, res);
          return;
        }

        response(200, result, 'Successfully update cars data', res);
      });
    });
  },
};
