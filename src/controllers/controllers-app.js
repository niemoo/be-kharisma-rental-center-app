const db = require('../configs/database.js');
const response = require('../configs/response.js');
const midtransClient = require('midtrans-client');

const generateBookingId = () => {
  const timestampPart = new Date().getTime().toString().slice(-2); // Get last 2 digits of the current timestamp
  const randomPart = Math.floor(Math.random() * 900) + 100; // Generate 3 random digits
  return timestampPart + randomPart; // Combine them to form a 5-digit ID
};

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
  addNewBooking: async (req, res) => {
    try {
      const { user_id, user_fullname, car_id, car_name, alamat, instagram, tujuan_sewa, rute, jaminan, total_price, tempat_ambil, start_time, end_time, start_date, end_date } = req.body;
      const booking_id = generateBookingId(); // replace with your actual function to generate booking_id
      const addNewBookingQuery = 'INSERT INTO bookings (id, user_id, car_id, booking_date) VALUES (?, ?, ?, ?)';
      const addBookingDetailQuery =
        'INSERT INTO booking_details (booking_id, alamat, instagram, tujuan_sewa, rute, jaminan, total_price, tempat_ambil, start_time, end_time, start_date, end_date, status, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
      const addPaymentQuery = 'INSERT INTO payments (booking_id, payment_status, snap_token) VALUES (?, ?, ?)';
      const deleteBookingQuery = 'DELETE FROM bookings WHERE id = ?';
      const dateFormat = new Date().toISOString().slice(0, 19).replace('T', ' ');

      db.query(addNewBookingQuery, [booking_id, user_id, car_id, dateFormat], async (err, bookingResult) => {
        if (err) throw err;

        try {
          await new Promise((resolve, reject) => {
            db.query(
              addBookingDetailQuery,
              [booking_id, alamat, instagram, tujuan_sewa, rute, jaminan, total_price, tempat_ambil, start_time, end_time, start_date, end_date, 'Awaiting Payment', dateFormat, dateFormat],
              async (err, detailResult) => {
                if (err) {
                  reject(err);
                } else {
                  // Initialize Midtrans Snap client
                  let snap = new midtransClient.Snap({
                    isProduction: false,
                    serverKey: process.env.MIDTRANS_SERVER_KEY,
                    clientKey: process.env.MIDTRANS_CLIENT_KEY,
                  });

                  const parameter = {
                    transaction_details: {
                      order_id: booking_id,
                      gross_amount: Number(total_price),
                    },
                    item_details: [
                      {
                        id: car_id,
                        price: Number(total_price),
                        quantity: 1,
                        name: car_name, // Example name, adjust according to your use case
                      },
                    ],
                    customer_details: {
                      first_name: user_fullname,
                      email: 'edi123@gmail.com',
                    },
                    callbacks: {},
                  };

                  try {
                    const transaction = await snap.createTransaction(parameter);
                    const transactionToken = transaction.token;
                    console.log('transactionToken:', transactionToken);

                    // Insert payment record
                    db.query(addPaymentQuery, [booking_id, 'Pending', transactionToken], (err, paymentResult) => {
                      if (err) {
                        reject(err);
                      } else {
                        response(201, { booking_id: booking_id, token: transactionToken }, 'Successfully add new booking', res);
                        resolve(paymentResult);
                      }
                    });
                  } catch (err) {
                    reject(err);
                  }
                }
              }
            );
          });
        } catch (err) {
          db.query(deleteBookingQuery, [booking_id], (delErr, delResult) => {
            if (delErr) {
              response(500, {}, delErr.message, res);
            } else {
              response(500, {}, err.message, res);
            }
          });
        }
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
