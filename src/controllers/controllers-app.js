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
  getInvoiceData: (req, res) => {
    try {
      const { booking_id } = req.params;

      const sql =
        'SELECT bookings.id AS booking_id, users.username, cars.name AS car_name, booking_details.total_price, booking_details.start_date, booking_details.end_date, booking_details.start_time, booking_details.end_time, booking_details.status FROM bookings JOIN users AS users ON bookings.user_id = users.id JOIN cars AS cars ON bookings.car_id = cars.id JOIN booking_details AS booking_details ON bookings.id = booking_details.booking_id WHERE bookings.id = ?;';

      db.query(sql, [booking_id], (err, result) => {
        if (err) throw err;

        response(200, result, `Successfully get invoice where booking id = ${booking_id}`, res);
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
};
