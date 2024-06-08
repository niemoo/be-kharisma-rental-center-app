const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../configs/database.js');
const response = require('../configs/response.js');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
};

module.exports = {
  registerUser: async (req, res) => {
    try {
      const { email, username, password, first_name, last_name, no_telp } = req.body;
      const salt = await bcrypt.genSaltSync(10);
      const encryptedPassword = await bcrypt.hashSync(password, salt);

      const checkEmailQuery = 'SELECT COUNT(*) AS emailCount FROM users WHERE email = ?';
      const checkUsernameQuery = 'SELECT COUNT(*) AS usernameCount FROM users WHERE username = ?';

      db.query(checkEmailQuery, [email], (emailErr, checkEmailResult) => {
        if (emailErr) {
          throw emailErr;
        }

        db.query(checkUsernameQuery, [username], (usernameErr, checkUsernameResult) => {
          if (usernameErr) {
            throw usernameErr;
          }

          const emailCount = checkEmailResult[0].emailCount;
          const usernameCount = checkUsernameResult[0].usernameCount;

          // Check if email or username already exists
          if (emailCount > 0) {
            response(404, {}, 'Email already exists', res);
          } else if (usernameCount > 0) {
            response(404, {}, 'Username already exists', res);
          } else {
            const getRoleId = 'SELECT * FROM roles WHERE name = "user"';

            db.query(getRoleId, (err, roleResult) => {
              if (err) {
                throw err;
              }

              const role_id = roleResult[0].id;

              const sql = 'INSERT INTO users (id, email, username, password, first_name, last_name, role_id, no_telp, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

              db.query(sql, [uuidv4(), email, username, encryptedPassword, first_name, last_name, role_id, no_telp, new Date().toISOString(), new Date().toISOString()], (err, result) => {
                if (err) {
                  throw err;
                }

                response(201, result, 'Successfully added new user data', res);
              });
            });
          }
        });
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
        if (err) {
          throw err;
        }

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
                const token = signToken(adminResult[0].id);
                response(200, { adminResult, token }, 'Login success as admin', res);
              } else {
                response(404, {}, 'Incorrect password for admin', res);
              }
            } else {
              response(404, {}, 'Role not found or not admin', res);
            }
          });
        } else {
          const checkUser = 'select * from users where username = ?';

          db.query(checkUser, [username], async (err, userResult) => {
            if (err) {
              throw err;
            }

            if (userResult && userResult.length > 0) {
              const token = signToken(userResult[0].id);
              const passwordMatch = await bcrypt.compareSync(password, userResult[0].password);
              if (passwordMatch) {
                response(200, { userResult, token }, 'Login success as a user', res);
              } else {
                response(404, {}, 'Incorrect password for user', res);
              }
            } else {
              response(404, {}, 'Username not found', res);
            }
          });
        }
      });
    } catch (err) {
      response(500, {}, err.message, res);
    }
  },
};
