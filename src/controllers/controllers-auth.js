// const { v4: uuidv4 } = require('uuid');
// const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../configs/database.js');
const response = require('../configs/response.js');

const addSignToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SIGN_TOKEN_SECRET, { expiresIn: process.env.JWT_SIGN_EXPIRES_IN });
};
const addRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_TOKEN_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
};

module.exports = {
  registerUser: async (req, res) => {
    try {
      const { username, password, full_name, no_telp } = req.body;

      const checkUsernameQuery = 'SELECT COUNT(*) AS usernameCount FROM users WHERE username = ?';

      db.query(checkUsernameQuery, [username], (usernameErr, checkUsernameResult) => {
        if (usernameErr) throw usernameErr;

        const usernameCount = checkUsernameResult[0].usernameCount;

        if (usernameCount > 0) {
          response(404, {}, 'Username tersebut sudah digunakan. Mohon gunakan username lain.', res);
        } else {
          const getRoleId = 'SELECT * FROM roles WHERE name = "user"';

          db.query(getRoleId, (err, roleResult) => {
            if (err) throw err;

            const role_id = roleResult[0].id;

            const sql = 'INSERT INTO users (username, password, full_name, role_id, no_telp, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?)';

            db.query(sql, [username, password, full_name, role_id, no_telp, new Date().toISOString(), new Date().toISOString()], (err, result) => {
              if (err) throw err;

              response(201, result, 'Successfully added new user data', res);
            });
          });
        }
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;

      const checkAdmin = 'select * from admin where username = ?';

      db.query(checkAdmin, [username], (err, adminResult) => {
        if (err) throw err;

        if (adminResult && adminResult.length > 0) {
          // If the username exists in the admin table, check the role_id
          const roleSql = 'SELECT * FROM roles WHERE id = ? AND name = ?';
          db.query(roleSql, [adminResult[0].role_id, 'admin'], (roleErr, roleResult) => {
            if (roleErr) {
              throw roleErr;
            }

            if (roleResult && roleResult.length > 0) {
              // If role_id matches 'admin', check the password
              const passwordMatch = password === adminResult[0].password;
              if (passwordMatch) {
                const accessToken = addSignToken(adminResult[0].id);
                response(200, { adminResult, accessToken }, 'Login success as admin', res);
              } else {
                response(404, {}, 'Incorrect password for admin', res);
              }
            } else {
              response(404, {}, 'Role not found or not admin', res);
            }
          });
        } else {
          const checkUser = 'SELECT * FROM users WHERE username = ?';
          const updateRefreshToken = 'UPDATE users SET refresh_token = ? WHERE username = ?';

          db.query(checkUser, [username], (err, userResult) => {
            if (err) throw err;

            if (userResult && userResult.length > 0) {
              const accessToken = addSignToken(userResult[0].id);
              const passwordMatch = password === userResult[0].password;
              if (passwordMatch) {
                const refreshToken = addRefreshToken(userResult[0].id);
                db.query(updateRefreshToken, [refreshToken, username], (err, updateRefreshTokenResult) => {
                  if (err) throw err;

                  // res.clearCookie('refreshToken', refreshToken, {
                  //   httpOnly: true, // ini memastikan cookie tidak dapat diakses melalui JavaScript di klien
                  //   maxAge: 24 * 60 * 60 * 1000, // contoh: ini akan mengatur cookie agar kadaluarsa dalam 24 jam
                  // });
                  // res.clearCookie('refreshToken', { path: '/' });

                  response(200, { user: { id: userResult[0].id, username: userResult[0].username }, accessToken, refreshToken }, 'Login success as a user', res);
                });
              } else {
                response(404, {}, 'Password yang anda masukkan salah.', res);
              }
            } else {
              response(404, {}, 'Username tidak ditemukan.', res);
            }
          });
        }
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
  refreshToken: (req, res) => {
    try {
      const refreshToken = req.cookies.refreshToken;
      const sql = 'SELECT * FROM users WHERE refresh_token = ?';

      if (!refreshToken) response(401, {}, 'Unathorized', res);

      db.query(sql, [refreshToken], (err, result) => {
        if (!result[0]) response(403, {}, 'Forbidden', res);

        jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET, (err, decoded) => {
          if (err) response(403, {}, 'Forbidden', res);

          const accessToken = addSignToken(result[0].id);

          response(200, { result, accessToken }, 'Success Check Refresh Token', res);
        });
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
};
