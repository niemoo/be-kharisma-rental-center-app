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
            response(404, null, 'Email already exists', res);
          } else if (usernameCount > 0) {
            response(404, null, 'Username already exists', res);
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
      response(500, null, err.message, res);
    }
  },
  loginUser: async (req, res) => {
    try {
      const { username, password } = req.body;

      const sql = 'select * from users where username = ?';

      db.query(sql, [username], async (err, result) => {
        if (err) {
          throw err;
        }

        const token = signToken(result[0].id);

        if (result == 0) {
          response(404, null, 'Username not found', res);
        } else {
          const passwordMatch = await bcrypt.compareSync(password, result[0].password);
          if (passwordMatch) {
            response(200, { result, token }, 'Login success', res);
          } else {
            response(404, null, 'Incorrect password', res);
          }
        }
      });
    } catch (err) {
      response(500, null, err.message, res);
    }
  },
};
