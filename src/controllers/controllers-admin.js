const { v4: uuidv4 } = require('uuid');
const db = require('../configs/database.js');
const response = require('../configs/response.js');

module.exports = {
  addRolesData: (req, res) => {
    const { name } = req.body;
    const sql = 'INSERT INTO roles (name) VALUES (?)';

    if (!name) {
      response(400, '', 'Error: Name is required', res);
    }

    db.query(sql, [name], (err, result) => {
      if (err) {
        response(500, err, err.message, res);
      }

      response(201, result, 'Successfully added roles', res);
    });
  },
  addAdminData: (req, res) => {
    const { username, password } = req.body;
    const sql = 'INSERT INTO admin (role_id, username, password, created_at, modified_at) VALUES (?, ?, ?, ?, ?)';
    const getRoleId = 'SELECT * FROM roles WHERE name = "admin"';

    if (!username) {
      response(400, '', 'Error: Name is required', res);
    }

    db.query(getRoleId, (err, roleResult) => {
      if (err) {
        throw err;
      }

      const role_id = roleResult[0].id;

      db.query(sql, [role_id, username, password, new Date().toISOString().slice(0, 19).replace('T', ' '), new Date().toISOString().slice(0, 19).replace('T', ' ')], (err, result) => {
        if (err) {
          response(500, err, err.message, res);
        }

        response(201, result, 'Successfully added admin data', res);
      });
    });
  },
  addCarsCategoryData: (req, res) => {
    try {
      const { name } = req.body;
      const sql = 'INSERT INTO cars_category (name) VALUES (?)';

      db.query(sql, [name], (err, result) => {
        if (err) throw err;

        response(201, result, 'Successfully added cars category data', res);
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
  addCarsData: (req, res) => {
    const { category_id, name, transmission, capacity, color, year, price_12, price_24, price_fullday } = req.body;
    const sql = 'INSERT INTO cars (category_id, name, transmission, capacity, color, year, image, price_12, price_24, price_fullday, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

    if (!req.file) {
      const err = new Error('Image Harus di Upload');
      err.errorStatus = 422;
      throw err;
    }

    db.query(
      sql,
      [category_id, name, transmission, capacity, color, year, req.file.filename, price_12, price_24, price_fullday, new Date().toISOString().slice(0, 19).replace('T', ' '), new Date().toISOString().slice(0, 19).replace('T', ' ')],
      (err, result) => {
        if (err) {
          response(500, err, err.message, res);
        }

        response(201, result, 'Successfully added cars data', res);
      }
    );

    // res.send(image);
  },
  getAllUsersData: (req, res) => {
    const sql = 'SELECT * FROM users';

    db.query(sql, (err, result) => {
      if (err) {
        response(500, err, err.message, res);
      }

      response(200, result, 'Successfully get users data', res);
    });
  },
  editCarsData: (req, res) => {
    const { id, category_id, name, transmission, capacity, color, year, price_12, price_24, price_fullday } = req.body;

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
        category_id: category_id || oldData.category_id,
        name: name || oldData.name,
        transmission: transmission || oldData.transmission,
        capacity: capacity || oldData.capacity,
        color: color || oldData.color,
        image: req.file ? req.file.filename : oldData.image,
        price_12: price_12 || oldData.price_12,
        price_24: price_24 || oldData.price_24,
        price_fullday: price_fullday || oldData.price_fullday,
        year: year || oldData.year,
        modified_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
      };

      // Lakukan pembaruan di database
      const sql = 'UPDATE cars SET category_id = ?, name = ?, transmission = ?, capacity = ?, color = ?, year = ?, image = ?, price_12 = ?, price_24 = ?, price_fullday = ?, modified_at = ? WHERE id = ?';
      const values = [newData.category_id, newData.name, newData.transmission, newData.capacity, newData.color, newData.year, newData.image, newData.price_12, newData.price_24, newData.price_fullday, newData.modified_at, id];

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
