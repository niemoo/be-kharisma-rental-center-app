const db = require('../configs/database.js');
const response = require('../configs/response.js');

module.exports = {
  getAllCarsData: (req, res) => {
    const sql = 'SELECT * FROM cars';

    db.query(sql, (err, result) => {
      if (err) {
        response(500, err, err.message, res);
      }

      response(200, result, 'Successfully get cars data', res);
    });
  },
  getSpecifiedCarData: (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM cars WHERE id = ?';

    db.query(sql, [id], (err, result) => {
      if (err) {
        throw new Error(err);
      }

      response(200, result, 'Successfully get specified car data', res);
    });
  },
};
