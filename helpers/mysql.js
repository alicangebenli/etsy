import mysql from "mysql";

const ip = '5.158.14.34'
const password = 'x459khPMAitVt4Q'
const username = 'webpikse_etsy'

const connection = mysql.createConnection({
    host: ip,
    user: username,
    password: password,
    database: username
})
connection.connect();
