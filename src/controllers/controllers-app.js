const db = require('../configs/database.js');
const response = require('../configs/response.js');

module.exports = {
  getAllCarsData: (req, res) => {
    try {
      const sql = 'SELECT * FROM cars';

      db.query(sql, (err, result) => {
        if (err) {
          response(500, err, err.message, res);
        }

        response(200, result, 'Successfully get cars data', res);
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
  getSpecifiedCarData: (req, res) => {
    try {
      const { id } = req.params;
      const sql = 'SELECT * FROM cars WHERE id = ?';

      db.query(sql, [id], (err, result) => {
        if (err) {
          throw new Error(err);
        }

        response(200, result, 'Successfully get specified car data', res);
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
  addNewOrder: (req, res) => {
    try {
      const { user_id, car_id, alamat, instagram, tujuan_sewa, rute_perjalanan, jaminan, jam_mulai_sewa, jam_akhir_sewa, tempat_ambil } = req.body;
      const sql = 'INSERT INTO order_details (user_id, car_id, alamat, instagram, tujuan_sewa, rute_perjalanan, jaminan, jam_mulai_sewa, jam_akhir_sewa, tempat_ambil) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

      db.query(sql, [user_id, car_id, alamat, instagram, tujuan_sewa, rute_perjalanan, jaminan, jam_mulai_sewa, jam_akhir_sewa, tempat_ambil], (err, result) => {
        if (err) {
          throw new Error(err);
        }

        response(200, result, 'Successfully create new order', res);
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
};
