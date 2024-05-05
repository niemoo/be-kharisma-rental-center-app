const { v4: uuidv4 } = require('uuid');
const db = require('../configs/database.js');
const response = require('../configs/response.js');

module.exports = {
  addRolesData: (req, res) => {
    const { name } = req.body;
    const sql = 'insert into roles (id, name, created_at, updated_at) values (?, ?, ?, ?)';

    if (!name) {
      response(400, '', 'Error: Name is required', res);
      return res.status(400).send({ error: 'Name is required.' });
    }

    db.query(sql, [uuidv4(), name, new Date().toISOString(), new Date().toISOString()], (err, result) => {
      if (err) {
        response(500, err, err.message, res);
      }

      response(201, result, 'Successfully added roles', res);
    });
  },
};
