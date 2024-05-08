const { v4: uuidv4 } = require('uuid');
const db = require('../configs/database.js');
const response = require('../configs/response.js');

module.exports = {
  registerUser: (req, res) => {
    try {
      const { email, username, password, first_name, last_name, no_telp } = req.body;
      const checkUsernameQuery = 'SELECT COUNT(*) AS usernameCount FROM users WHERE username = ?';

      db.query(checkUsernameQuery, [username], (err, checkUsernameResult) => {
        if (err) {
          throw err;
        }

        const usernameCount = checkUsernameResult[0].usernameCount;

        if (usernameCount > 0) {
          response(404, null, 'Username already exists', res);
        } else {
          const getRoleId = 'SELECT * FROM roles WHERE name = "user"';

          db.query(getRoleId, (err, roleResult) => {
            if (err) {
              throw err;
            }

            const role_id = roleResult[0].id;

            const sql = 'INSERT INTO users (id, email, username, password, first_name, last_name, role_id, no_telp, created_at, modified_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';

            db.query(sql, [uuidv4(), email, username, password, first_name, last_name, role_id, no_telp, new Date().toISOString(), new Date().toISOString()], (err, result) => {
              if (err) {
                throw err;
              }

              response(201, result, 'Successfully added new user data', res);
            });
          });
        }
      });
    } catch (err) {
      response(500, null, err.message, res);
    }
  },
};
