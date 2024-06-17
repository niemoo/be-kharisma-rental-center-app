const db = require('../configs/database.js');
const response = require('../configs/response.js');

module.exports = {
  getAllCarsData: (req, res) => {
    try {
      const sql = 'SELECT * FROM cars';

      db.query(sql, (err, result) => {
        if (err) throw err;

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
        if (err) throw err;

        response(200, result, 'Successfully get specified car data', res);
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
  addNewBooking: (req, res) => {
    try {
      const { user_id, car_id, alamat, instagram, tujuan_sewa, rute, jaminan, total_price, tempat_ambil, start_time, end_time, start_date, end_date } = req.body;
      const addNewBooking = 'INSERT INTO bookings (user_id, car_id, booking_date) VALUES (?, ?, ?)';
      const addBookingDetail =
        'INSERT INTO booking_details (booking_id, alamat, instagram, tujuan_sewa, rute, jaminan, total_price, tempat_ambil, start_time, end_time, start_date, end_date, status, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const dateFormat = new Date().toISOString().slice(0, 19).replace('T', ' ');

      db.query(addNewBooking, [user_id, car_id, dateFormat], (err, bookingResult) => {
        if (err) throw err;

        response(201, bookingResult, 'Successfully add new booking', res);
        const booking_id = bookingResult.data.insertId;

        db.query(addBookingDetail, [booking_id, alamat, instagram, tujuan_sewa, rute, jaminan, total_price, tempat_ambil, start_time, end_time, start_date, end_date, 'Awaiting Payment', dateFormat, dateFormat], (err, detailResult) => {
          if (err) throw err;

          response(201, detailResult, 'Successfully add new booking', res);
        });
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
  addNewPayment: (req, res) => {
    try {
      const { booking_id, amount } = req.body;
      const searchBookingId = 'select id from bookings where id = ?';

      db.query(searchBookingId, [booking_id], (err, searchBookingResult) => {});
      const sql = 'INSERT INTO payments (id, booking_id, amount, payment_date, payment_status) VALUES (?, ?, ?, ?, ?)';

      // db.query(sql, [booking_id, amount, new Date().toISOString().slice(0, 19).replace('T', ' '), 'Pending'], (err, result) => {});
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
};
