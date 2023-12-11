const mysql = require('mysql2');

export const db = mysql.createConnection({
        host: '127.0.0.1',
        user: "root",
        password: "sqlwwtdd",
        database: "myIRC"
    })
    
    db.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        db.query("CREATE DATABASE IF NOT EXISTS myIRC", function (err, result) {
          if (err) throw err;
          // console.log("Database created");
        });
    });
    
//     db.connect();

// module.exports = db;


db.connect(function(err) {
    if (err) throw err;
    // console.log("Connected!");
    var sql = "CREATE TABLE IF NOT EXISTS channels (id INT PRIMARY KEY NOT NULL AUTO_INCREMENT, name VARCHAR(255) NOT NULL)";
    db.query(sql, function (err, result) {
      if (err) throw err;
      // console.log("Table created");
    });
});

db.connect(function(err) {
    if (err) throw err;
    // console.log("Connected!");
    let sql = "CREATE TABLE IF NOT EXISTS users (id INT PRIMARY KEY NOT NULL AUTO_INCREMENT, username VARCHAR(255), password VARCHAR(255), role_id INT NOT NULL, FOREIGN KEY (role_id) REFERENCES roles(id))";
    db.query(sql, function (err, result) {
      if (err) throw err;
      // console.log("Table created");
    });
});

db.connect(function(err) {
    if (err) throw err;
    // console.log("Connected!");
    let sql = "CREATE TABLE IF NOT EXISTS messages (id INT PRIMARY KEY NOT NULL AUTO_INCREMENT, receiver_id INT NOT NULL, expeditor_id INT NOT NULL, content VARCHAR(5000) NOT NULL, FOREIGN KEY(receiver_id) REFERENCES users(id), FOREIGN KEY(expeditor_id) REFERENCES users(id))";
    db.query(sql, function (err, result) {
      if (err) throw err;
      // console.log("Table created");
    });
});

// db.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
//     let sql = "INSERT INTO channels (name) VALUES ('admin')";
//     db.query(sql, function (err, result) {
//       if (err) throw err;
//       console.log("1 record inserted");
//     });
//   });

  // db.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  //   let sql = "INSERT INTO channels (name) VALUES ('admin')";
  //   db.query(sql, function (err, result) {
  //     if (err) throw err;
  //     console.log("1 record inserted");
  //   });
  // });

  // db.connect(function(err) {
  //   if (err) throw err;
  //   console.log("Connected!");
  //   let sql = "INSERT INTO users (username, password, role_id) VALUES ('user3', 'toto', 2)";
  //   db.query(sql, function (err, result) {
  //     if (err) throw err;
  //     console.log("1 record inserted");
  //   });
  // });