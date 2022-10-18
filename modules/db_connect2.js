const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASS || "root",
    database: process.env.DB_NAME || "proj57",
    waitForConnections: true,
    connectionLimit: 5,
    queryFormat: 0,
});

module.exports = pool.promise();