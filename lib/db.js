const mysql = require('mysql');

// DB 설정 파일
const config = require('./db_config.json');

const pool = mysql.createPool(config);

module.exports = pool;