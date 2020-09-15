// app_mysql.js
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var fs = require('fs');
var mysql = require('mysql');		// node-mysql을 install하고 모듈을 불러와야한다.
var conn = mysql.createConnection({ // mysql과 connection하는 부분
    host     : 'localhost',
    user     : 'root',
    password : '111111',
    database : 'o2'
});
app.use(bodyParser.urlencoded({ extended: false }));
app.set('views', './views');
app.set('view engine', 'ejs');

app.get(['/content','/content/:cate_code'], function(req, res){//메인페이지(CON_NAME값을 통하여 글 내용을 볼 수 있음)
    var sql = 'SELECT rank, con_name from (select ( @rank := @rank + 1 ) AS rank, con_name FROM content AS a, (SELECT @rank := 0 ) AS b ORDER BY a.con_download DESC) RANK WHERE rank <=5';
 //전체 글목록 가져오기
    conn.query(sql, function(err, contents, fields){
      var con_name = req.params.con_name; // request받은 CON_NAME값
      var cate_code = req.params.cate_code;
      if(con_name){// 글을 선택 했을때.
        var sql = 'SELECT * FROM content WHERE cate_code=?';
        conn.query(sql, [cate_code], function(err, content, fields){//[CON_NAME] : 사용자로부터 받은 CON_NAME
          if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          } else {
            res.render('first_page', {layout:true, contents : contents, content : content[0] });
          }
        });
      } else {// 글을 선택하지 않았을때.(메인페이지만 보여준다.)
        res.render('first_page', {contents : contents, content : undefined })//content의 데이터가 없어도 content을 명시해 주지 않는다면 ejs가 오류를 낸다.
      }
    });
});
app.listen(3000, function(){
    console.log("Connected localhost:3000");
});
