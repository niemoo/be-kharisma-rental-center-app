const jwt = require('jsonwebtoken');
const db = require('../configs/database.js');

function userAuthMiddleware(req, res, next) {
  let token, decoded;
  const clientToken = localStorage.getItem('accessToken');

  // TO CHECK THERE IS A TOKEN OR NOT IN THE HEADER
  if (clientToken) {
    token = clientToken.split(' ')[1];
  }

  if (!token) {
    return next(
      res.status(401).json({
        status: 401,
        message: 'Invalid token, please login first',
      })
    );
  }

  // TO DECODE VERIFICATION TOKEN
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
  } catch (err) {
    return next(
      res.status(401).json({
        error: err,
        message: 'Invalid token',
      })
    );
  }

  // GET USER DATA BY DECODED CONDITION
  const sql = 'select * from users where id = ?';

  db.query(sql, [decoded.id], (err, result) => {
    if (err) {
      return next(err);
    }

    if (result.length === 0) {
      return res.status(401).json({
        status: 401,
        message: 'User does not exist, the token is invalid',
      });
    }

    // Mengisi req.user dengan data pengguna yang ditemukan
    req.user = result[0];

    // Memanggil next() untuk melanjutkan ke middleware atau handler rute berikutnya
    next();
  });
}

module.exports = userAuthMiddleware;
