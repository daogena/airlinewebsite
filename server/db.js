const Pool = require('pg').Pool;
const fs = require('fs'); 

let data = fs.readFileSync('password.txt', 'utf8');
let user = data.toString().substring(0,8); 
let password = data.toString().substring(9,18);

const pool = new Pool({
  host: 'code.cs.uh.edu',
  user: user,
  password: password,
  port: 5432,
  database: 'COSC3380'
});


module.exports = pool;