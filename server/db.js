const Pool = require('pg').Pool;

const pool = new Pool({
  host: 'code.cs.uh.edu',
  user: 'cosc0137',
  password: '1845342DG',
  port: 5432,
  database: 'COSC3380'
});


module.exports = pool;