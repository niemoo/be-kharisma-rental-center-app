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
      const addPayment = 'INSERT INTO payments (booking_id, payment_status) VALUES (?, ?)';
      const dateFormat = new Date().toISOString().slice(0, 19).replace('T', ' ');

      db.query(addNewBooking, [user_id, car_id, dateFormat], (err, bookingResult) => {
        if (err) throw err;

        const booking_id = bookingResult.insertId;

        db.query(addBookingDetail, [booking_id, alamat, instagram, tujuan_sewa, rute, jaminan, total_price, tempat_ambil, start_time, end_time, start_date, end_date, 'Awaiting Payment', dateFormat, dateFormat], (err, detailResult) => {
          if (err) throw err;
          db.query(addPayment, [booking_id, 'Pending'], (err, paymentResult) => {
            response(201, { bookingResult: detailResult, paymentResult: paymentResult }, 'Successfully add new booking', res);
          });
        });
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
};
