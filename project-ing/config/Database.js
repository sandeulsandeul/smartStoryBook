/*아래의 mysql store 에 관계없이 추가적으로 아래의 mysql를 호출해주어야 한다.(주의!)*/
module.exports =function(){
   var mysql = require('mysql');
   var conn =  mysql.createConnection({
     host: 'localhost',
     user: 'root',
     password: '111111',
     database: 'o2'
   });
    conn.connect();
   return conn;
 }
