/*---.js코드를 부르기------*/
var app = require('./config/express')(); //config ->express.js를 부르기
var express = require('express');
var passport = require('./config/passport')(app);
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();
var hasher2 = bkfd2Password();
var fs =require('fs');//#
var conn = require('./config/Database')();
var nodemailer = require("nodemailer");
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var multer = require('multer');
var _storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../project-ing/')// 사용자에 따라 수정 need
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
})
var upload = multer({ storage: _storage })
var path=require('path');
var util = require('util');
var mime=require('mime-types');
 //app.set('view engine', 'jade');
 var cons = require('consolidate');
 var time = require('date-utils');
app.engine('ejs', cons.ejs)
app.engine('jade', cons.jade)
 app.set('views', __dirname + '/views');
 //app.set('view engine', 'ejs');
 app.set('view engine', 'jade');
 app.engine('html', require('ejs').renderFile);
 app.use(express.static('public'));

 app.use(bodyParser.urlencoded({extended: false}));
 app.use(bodyParser.json());
 app.use(cookieParser('23879ASDF234sdf@!#$a'));
 app.locals.pretty = true;

 /*산아*/

app.get('/count', function(req, res){
           if(req.session.count) {
             req.session.count++;
           } else {
             req.session.count = 1;
           }
           res.send('count : '+req.session.count);
});
app.get('/main', function(req, res){
          var person = req.user;
           if(person==undefined) {
             res.render('main_logout.html');
           }else{
             res.render ('main_login.html');
           }
});
 app.get('/cart/add/:conid/:page', function(req, res){
   var conid = req.params.conid;
   var page = req.params.page;
   var totalprice = req.signedCookies.totalprice || 0 ;
   var cartnum = req.signedCookies.cartnum || 0 ;
   var cart =req.signedCookies.cart || {};
   var sql = 'SELECT con_price FROM content WHERE con_id = ' + conid;
   if ( cart[conid] != 1) {
        cart[conid] = 1 ;
        cartnum++;
        conn.query(sql, function(err, content, fields){
          if(err){
            console.log(err);
            res.status(500).send('Internal Server Error');
          }
          else {
            totalprice = parseInt(totalprice) +  parseInt(content[0].con_price) ;
            console.log(totalprice);
            res.cookie('totalprice',totalprice, {signed:true});
            res.cookie('cart',cart, {signed:true});
            res.cookie('cartnum',cartnum, {signed:true});
            res.redirect('/Category/'+ page);
          }
        });
      }
    });
 app.get('/cart/delete/:conid', function(req, res){
   var conid = req.params.conid;
   var cartnum = req.signedCookies.cartnum || 0 ;
   var totalprice = req.signedCookies.totalprice ;
   var cart = req.signedCookies.cart || {};
   var sql = ' SELECT con_price FROM content WHERE con_id = '+ conid;
   if( req.signedCookies.cart) {
     cart[conid] = 0 ;
     if (cartnum <= 0 ) {
       cartnum = 0 ;
       totalprice = 0;
     }
     else{
       cartnum--;
       conn.query(sql, function(err, content, fields){
           if(err){
             console.log(err);
             res.status(500).send('Internal Server Error');
           }
           else {
             totalprice = parseInt(totalprice) - parseInt(content[0].con_price) ;
             res.cookie('cart',cart, {signed:true});
             res.cookie('cartnum',cartnum, {signed:true});
             res.cookie('totalprice',totalprice, {signed:true});
             res.redirect('/cart');
            }
      });
    };
  };
});

 app.get('/cart', function(req, res){
    var cart = req.signedCookies.cart ;
    var cartnum = req.signedCookies.cartnum || 0;
    var person = req.user;
    var totalprice = req.signedCookies.totalprice || 0 ;
    var sql0 = '';
    if ( totalprice > 0 ) {
       for (var id in cart ) {
         if(cart[id] > 0){
         console.log(id);
         sql0 = sql0+ id+ ' OR con_id =';
       }}
       sql0 += '1111111'
       console.log(sql0);
       var sql = ' SELECT con_name,con_price,con_imge_filepath,con_id FROM content WHERE con_id = ' + sql0 ;
       console.log(sql);
       conn.query(sql, function(err, content, fields){
           if(err){
             console.log(err);
             res.status(500).send('Internal Server Error');
           }
           else{
             if(person) {
               res.render('cartLogin.ejs',{content:content, cartnum:cartnum, totalprice:totalprice});
             }else{
               res.render('cartLogout.ejs',{content:content,cartnum:cartnum,totalprice:totalprice});
             }
           }
        });
     }
     else {
       res.render('cartNaN.ejs', {cartnum:cartnum, totalprice:totalprice});
     }
    });

app.get('/buynow/add/:conid', function(req, res){
  var conid = req.params.conid;
  var page = req.params.page;
  var nowprice = req.signedCookies.nowprice || 0 ;
  var sql = 'SELECT con_price FROM content WHERE con_id = ' + conid;
  var nowcart = conid ;
  console.log(nowcart);
  res.cookie('nowcart',nowcart, {signed:true});
  res.redirect('/buynow');
  });

app.get('/buynow', function(req, res){
      var nowcart = req.signedCookies.nowcart ;
      var cartnum = req.signedCookies.cartnum ;
      var person = req.user;
      var sql0 = '';
      var sql = ' SELECT con_name,con_price,con_imge_filepath,con_id FROM content WHERE con_id = ' + nowcart;
      conn.query(sql, function(err, content, fields){
             if(err){
               console.log(err);
               res.status(500).send('Internal Server Error');
             }
             else{
               var nowprice = content[0].con_price;
               res.cookie('nowprice',nowprice, {signed:true});
               if(person) {
                 console.log(nowprice);
                 res.render('cartnowLogin.ejs',{content:content, cartnum:cartnum, nowprice:nowprice});
               }else{
                 res.render('cartnowLogout.ejs',{content:content,cartnum:cartnum,nowprice:nowprice});
               }
             }
          });
      });


app.get('/pay', function(req, res){
    var totalprice = req.signedCookies.totalprice || 0 ;
   res.render ('pay_ing',{totalprice:totalprice});
 });
 app.get('/paynow', function(req, res){
     var nowprice = req.signedCookies.nowprice || 0 ;
    console.log(nowprice);
    res.render ('pay_ing',{totalprice:nowprice});
  });
 app.get('/pay_ing2',function(req,res){
   res.render ('pay_ing2.ejs');
 });
 app.get('/pay_end', function(req, res){
   var cart = req.signedCookies.cart;
   for( var index in cart ) {
     if(parseInt(cart[index])>0) {
       var sql = ' SELECT con_download,con_id FROM content WHERE con_id = '+ index ;
       conn.query(sql, function(err, content, fields){
           if(err){
             console.log(err);
             res.status(500).send('Internal Server Error');
           };
           for( var id in content ) {
             var updatenum = parseInt(parseInt(content[id].con_download)+1 );
             var sql = 'UPDATE content SET con_download=? WHERE con_id= ?' ;
             conn.query(sql, [content[id].updatenum,content[id].con_id], function(err, row, fields){
               if(err){
                 console.log(err);
                 res.status(500).send('Internal Server Error');
               };
                  console.log('pay_end');
                   res.redirect('/userbuylistupdate');
             });
       }});
     }} });
app.get('/userbuylistupdate',function(req,res){
  var cart = req.signedCookies.cart;
  var user_name = req.user.username;
  var newDate = new Date();
  var buydate = newDate.toFormat('YYYY-MM-DD');
  console.log('bb');
  for( var index in cart ) {
      var sql1= 'SELECT * FROM CONTENT WHERE con_id=' + index ;
      console.log(sql1);
      conn.query(sql1,function(err,buyenditem,fields){
        for (var i in buyenditem) {
          var buynum = 1 ;
          var products_name = buyenditem[i].con_name;
          var confilesize =  '12kb';
          var confilepath = 'C:/Users/정산아/ewhaGraduationProject/project-ing/music';
          var sql2 = 'INSERT INTO user_buylist (username,con_name,buy_date,buy_num,con_filesize,con_filepath) VALUES(?,?,?,?,?,?)  ';
          var params = [user_name,products_name,buydate,buynum,confilesize,confilepath,user_name, products_name];
          conn.query(sql2, params, function(err, content, fields){
            if(err){
              console.log(err);
              res.status(500).send('Internal Server Error');
                 };
        res.redirect('/mypage/download');
      })
        }
  })
}
})
app.get('/mypage/download',function(req,res){
     var cart = req.signedCookies.cart;
     var cartnum = 0;
     res.cookie('cartnum',cartnum, {signed:true});
     res.clearCookie(cart);
     var sql3 = 'SELECT * from user_buylist';
     conn.query(sql3,function(err,rows,fields){
       if(err){
         console.log(err);
         res.status(500).send('Internal Server Error');
       }
       else {
         console.log(rows);
         if (rows) {
            console.log(rows);
           res.render ('mypage_download.ejs',{rows:rows});
         }
         else {
           res.render ('mypage_emptydownload.ejs',{rows:row});
         }
       }
     })
   });
   /* 주의 각각 pc에 맞게 수정해서 사용하기!*/
 app.get('/download/:id', function(req, res){
   var id = req.params.id;
   var cart = req.signedCookies.cart;
   var sql = 'SELECT * FROM content WHERE con_id = ' + id;
   conn.query(sql,function(err,download,fields){
     for (var i in download){
       var origFileName = download[i].con_id + '.mp3';
       var savedFileName = download[i].con_id +'.mp3';
       var savedPath ='/Users/정산아/ewhaGraduationProject/project-ing/music';
       var filSize = '123kb';
       var file =savedPath + '/' + savedFileName;
       mimetype = mime.lookup(origFileName);
       res.setHeader('Content-disposition','attachment; filename=' +origFileName);
       res.setHeader('Content-type',mimetype);
       var filestream = fs.createReadStream(file);
       filestream.pipe(res);
     }
 });
});
 /*세희*/
  app.get('/search_bar', function(req, res){
   res.render('search_bar.ejs');
 })


app.get('/Category/:id', function(req, res){//메인페이지(CON_NAME값을 통하여 글 내용을 볼 수 있음)
var id = req.params.id;
var page = req.params.id;
var cartnum = req.signedCookies.cartnum;
var sql = 'SELECT rank, con_name from (select ( @rank := @rank + 1 ) AS rank, con_name FROM content AS a, (SELECT @rank := 0 ) AS b ORDER BY a.con_download DESC) RANK WHERE rank <=5';
conn.query(sql, function(err, contents, fields){
    var sql2 = 'SELECT con_imge_filepath, con_name, con_price,con_id from content where cate_code= ' + id;
    conn.query(sql2, function(err, content){
      if(err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      } else {
        res.render('Category.ejs', {layout:true, page:page, contents : contents, content : content, id:id, cartnum:cartnum});
      }
    })
});
});
app.get('/CategoryContent:id', function(req, res){
  var id = req.params.id;
  var start_page = (req.query.page-1)*3;
    var sql1 = 'set @a=?';
    conn.query(sql1, [start_page], function(err, con1){
      var sql2 = 'prepare stmt from \'select con_imge_filepath, con_name, con_price, con_id from content where cate_code=1 limit ?, 3\';';
      conn.query(sql2, function(err, con2){
        var sql3 = 'execute stmt using @a;';
        conn.query(sql3, function(err, content){
          if(err) {
            console.log(err);
            res.status(500).send('Internal Server Error');
          } else {
            res.render('CategoryContent.ejs', {layout:true, content : content, id:id});
          }
        });
      })
    })
  });

 app.get('/search_result', function(req, res){//메인페이지(CON_NAME값을 통하여 글 내용을 볼 수 있음)
  var searchWord = "%"+req.query.searchWord+"%";

   var cartnum = req.signedCookies.cartnum || 0 ;
  console.log(searchWord);
  var sql = 'SELECT rank, con_name from (select ( @rank := @rank + 1 ) AS rank, con_name FROM content AS a, (SELECT @rank := 0 ) AS b ORDER BY a.con_download DESC) RANK WHERE rank <=5';
  conn.query(sql, function(err, contents, fields){
    var sql = 'SELECT con_imge_filepath, con_name, con_price from content where con_name LIKE ?';
    conn.query(sql, [searchWord], function(err, content, fields){
      if(err) {
        console.log(err);
        res.status(500).send('Internal Server Error');
      } else {
        res.render('search_result.ejs', {layout:true, contents : contents, content : content,cartnum:cartnum});
      }
    });
  });
});
app.get('/recommend',function(req,res){
  var id  = 3
  var page = req.params.id;
  var cartnum = req.signedCookies.cartnum;
  var sql = 'SELECT rank, con_name from (select ( @rank := @rank + 1 ) AS rank, con_name FROM content AS a, (SELECT @rank := 0 ) AS b ORDER BY a.con_download DESC) RANK WHERE rank <=5';
  conn.query(sql, function(err, contents, fields){
      var sql2 = 'SELECT con_imge_filepath, con_name, con_price,con_id from content where cate_code= ' + id;
      conn.query(sql2, function(err, content){
        if(err) {
          console.log(err);
          res.status(500).send('Internal Server Error');
        } else {
          res.render('recommend.ejs', {layout:true, page:page, contents : contents, content : content, id:id, cartnum:cartnum});
        }
      })
  });
})
 app.get('/search_result_content', function(req, res){
   var searchWord = "%"+req.query.searchWord+"%";
   var start_page = ((req.query.page||1)-1)*2;
    var cartnum = req.signedCookies.cartnum || 0 ;
   conn.query(
     'SELECT * FROM `content` WHERE `con_name` LIKE ? LIMIT ?, 2',
     [searchWord, start_page],
     function(err, content, fields) {
       if(err) {
         console.log(err);
         res.status(500).send('Internal Server Error');
       } else {
         res.render('search_result_content.ejs', {layout:true, content:content, cartnum:cartnum});
       }
     }
   );
 });

app.post('/login', passport.authenticate('local',
        {
          successRedirect: '/main',
          failureRedirect: '/login',
          failureFlash: false
        }
      )
    );
    app.get('/facebook',passport.authenticate('facebook',
        {scope:'email'}
      )
    );
    app.get('/facebook/callback',passport.authenticate('facebook',
        {
          successRedirect: '/main',
          failureRedirect: '/login'
        }
      )
    );
    var users = [
      {
        authId:'local:egoing',
        username:'egoing',
        password:'mTi+/qIi9s5ZFRPDxJLY8yAhlLnWTgYZNXfXlQ32e1u/hZePhlq41NkRfffEV+T92TGTlfxEitFZ98QhzofzFHLneWMWiEekxHD1qMrTH1CWY01NbngaAfgfveJPRivhLxLD1iJajwGmYAXhr69VrN2CWkVD+aS1wKbZd94bcaE=',
        salt:'O0iC9xqMBUVl3BdO50+JWkpvVcA5g2VNaYTR5Hc45g+/iXy4PzcCI7GJN5h5r3aLxIhgMN8HSh0DhyqwAp8lLw==',
        name:'Egoing',
        email:'egoing@naver.com',
        phone_num:'010-8740-2820',
      }
    ];
app.post('/register_step3', function(req, res){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
      var user = {
          authId:'local:'+req.body.username,
          username:req.body.username,
          password:hash,
          salt:salt,
          name:req.body.name,
          email:req.body.email,
          phone_num:req.body.phone_num,
          child_old:req.body.child_old,
          favorite1:req.body.favorite1,
          favorite2:req.body.favorite2,
          favorite3:req.body.favorite3,
          favorite4:req.body.favorite4  //..Right?
      };
      var sql ='INSERT INTO users SET ?';  //mysql에 상에 가입한 정보를 insert
        conn.query(sql, user, function(err, results){
          if(err)
          {
            console.log(err);
            res.status(500);
          }else{
           req.login(user, function(err){
             req.session.save(function(){
               res.redirect('/main');
             });
           });
          }
        });
      });
    });
app.get('/register_step1',function(req, res){
   res.render('register_step1.html');
});
app.post('/register_step1',function(req, res){//submit할때, post need!!
       res.redirect('/register_step2');
});
app.get('/register_step2',function(req, res){
 res.render('register_step2.html');
});
app.get('/register_step2_result',function(req, res){
  res.render('register_step2_result.html');
});
app.get('/register_step3',function(req, res){
 res.render('register_step3.html');
});app.post('/register_step2',function(req, res){
  var user=user;
  var email=req.body.email;
  if(email){
   res.redirect('/register_step2_result');
  var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "tnwls2820@gmail.com",
        pass: "rkfcl60434"
    }
  });
  var mailOptions = {
    from: '안수진 <tnwls2820@gmail.com>',
    to: 'tnwls2820@gmail.com',
    subject: '회원가입 완료_Smart Player',

    html:
    '<h1>회원가입 인증_Smart Player</h1><br>인증을 하기 위해서는 하단의 링크를 클릭해주세요.</br><br><a href="http://localhost:3003/register_step3"style="margin-left:80px;">회원가입 인증완료</a></br><p><img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Player_%28logo1%29.jpg"/></p>'
  }; //# 2018_09_29
  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error){
        console.log(error);
    } else { //uer에 대한 일치 여부 확인 @ _실패시 send하지 않고, search_PW_fail 호출하기
        console.log("Message sent : " + response.message);
    }
    smtpTransport.close();
    });
  }
});
app.get('/login',function(req, res){
      res.render('main_login.html');
});
app.get('/logout', function(req, res){
      req.logout();
      req.session.save(function(){
        res.render('main_logout.html');
      });
      if(err){
        console.log(err);
        return done(null,err);
    }
});

app.post('/manager_login', passport.authenticate('local',
        {
          successRedirect: '/managerpage',
          failureRedirect: '/main',
          failureFlash: false
        }
      )
    );
app.get('/manager_login',function(req, res){
          res.render('managerpage.ejs');
    });
app.get('/manager_logout', function(req, res){

          req.logout();
          req.session.save(function(){
            res.render('main_logout.html');
          });
          if(err){
        console.log(err);
        return done(null,err);
    }
    });
app.post('/manager_register_step3', function(req, res){
       hasher2({password:req.body.password}, function(err, pass, salt, hash){
       var manager = {
         authId:'local:'+req.body.username,
         companyname:req.body.companyname,
         password:hash,
         salt:salt,
         name:req.body.name,
         email:req.body.email,
         phone_num:req.body.phone_num,
       };
       var sql ='INSERT INTO manager SET ?';  //mysql에 상에 가입한 정보를 insert
       conn.query(sql, manager, function(err, results){
         if(err)
         {
           console.log(err);
           res.status(500);
         }else{
           req.login( manager , function(err){
           req.session.save(function(){
            res.redirect('/manager_page');
          })
        })
          }
        });
       });
     });
 app.get('/manager_register_step1',function(req, res){
    res.render('manager_register_step1.html');
 });
 app.post('/manager_register_step1',function(req, res){//submit할때, post need!!
        res.redirect('/manager_register_step2');
 });
 app.get('/manager_register_step2',function(req, res){
  res.render('manager_register_step2.html');
 });
 app.get('/manager_register_step2_result',function(req, res){
   res.render('manager_register_step2_result.html');
 });
 app.get('/manager_register_step3',function(req, res){
  res.render('manager_register_step3.html');
 });
 app.post('/manager_register_step2',function(req, res){
   var manager = manager;
   var email=req.body.email;
   if(email){
    res.redirect('/register_step2_result');
   var smtpTransport = nodemailer.createTransport({
     service: "Gmail",
     auth: {
         user: "tnwls2820@gmail.com",
         pass: "rkfcl60434"
     }
   });
   var mailOptions = {
     from: '안수진 <tnwls2820@gmail.com>',
     to: email,
     subject: '회원가입 이메일인증 _Smart Player',
     html:
     '<h1>회원가입 이메일인증_Smart Player</h1><br>인증을 하기 위해서는 하단의 링크를 클릭해주세요.</br><br><a href="http://127.0.0.1:8080/register_step3"style="margin-left:80px;">회원가입 인증완료</a></br><p><img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Player_%28logo1%29.jpg"/></p>'
   };
   smtpTransport.sendMail(mailOptions, function(error, response){
     if (error){
         console.log(error);
     } else { //uer에 대한 일치 여부 확인 @ _실패시 send하지 않고, search_PW_fail 호출하기
         console.log("Message sent : " + response.message);

     smtpTransport.close();
   }});
   }
 });

 app.get('/managerpage',function(req, res){  //only get 방식!!
                 var sql='SELECT companyname, name, email, phone_num FROM manager';
                 conn.query(sql ,function(err, user, fields){
                if(err){
                console.log(err);
                res.status(500).send('Internal Server Error');
               }else{
                res.render('manager_page.ejs',
                { layout:true,
                  user:user,
                  companyname:req.user.companyname,
                  name:req.user.name,
                  email:req.user.email,
                  phone_num:req.user.phone_num,
                });
            }
          });
 });


app.post('/manager_Bookupdate',function(req, res){
var newContent =  {
  'con_name' : req.body.con_name,
  'con_id' :req.body.con_id,
  'cate_code' : req.body.cate_code,
  'cate_kind' :req.body.cate_kind,
  'con_imge_filesize': req.body.con_imge_filesiz,
  'con_imge_filepath': req.body.con_imge_filepath,
  'con_download' : req.body.con_download,
  'con_price' : req.body.con_price,
  'reg_date' : req.body.reg_date
}
var newcompanycontent = {
    'conpanyname' : req.body.con_name,
    'con_id' :req.body.con_id,
    'reg_date' : req.body.reg_date
}
console.log(newContent);
conn.query('insert into content set ?', newContent ,function(err, content){
  if (err) {
            console.error(err);
            throw err;
        }
});
conn.query('insert into companycontent set ?', newcompanycontent ,function(err, content){
  if (err) {
            console.error(err);
            throw err;
        }
});
});

app.get('/manager_Bookupdate',function(req, res){
    res.render('bookupdate.ejs');
});


app.get('/companyBook',function(req, res){
    res.render('booklist.ejs');
});

app.get('/manager/modify',function(req, res){
          var sql='SELECT username, name, email, phone_num, child_old FROM users';
          conn.query(sql ,function(err, user, fields){
         if(err){
         console.log(err);
         res.status(500).send('Internal Server Error');
        }else{
           res.render('managerModify.ejs',
           { layout:true,
            manage:manager,
            companyname:req.user.companyname,
            name:req.user.name,
            email:req.user.email,
            phone_num:req.user.phone_num,
            child_old:req.user.child_old})
          }});
   });

app.get('/mypage',function(req, res){  //only get 방식!!
                   var sql='SELECT username, name, email, phone_num, child_old FROM users';
                   conn.query(sql ,function(err, user, fields){
                  if(err){
                  console.log(err);
                  res.status(500).send('Internal Server Error');
                 }else{
                  res.render('mypage.ejs',
                  { layout:true,
                    user:user,
                    username:req.user.username,
                    name:req.user.name,
                    email:req.user.email,
                    phone_num:req.user.phone_num,
                    child_old:req.user.child_old
                  });
              }
            });
   });
app.get('/download/player', function(req, res){
           var sql='SELECT username FROM users';
           conn.query(sql ,function(err, user, fields){
          if(err){
          console.log(err);
          res.status(500).send('Internal Server Error');
         }else{
           console.log(req.user.username);
           console.log("id : "+req.user.username);//
            var data = "user authentication : "+req.user.username;
            // 2. 비동기 방식으로 파일을 생성. 함수의 인자는 앞에서 부터 순서대로 파일명, 입력데이터, 인코딩, 콜백함수
            fs.writeFile('C:Desktop/authentication.txt', data, 'utf-8', function(e){
                if(e){
                    // 3. 파일생성 중 오류가 발생하면 오류출력
                    console.log(e);
                }else{
                    // 4. 파일생성 중 오류가 없으면 완료 문자열 출력
                    console.log('WRITE DONE!');
                }
            });
            fs.chmodSync('authentication.txt', '700');
      }
    });
   })
app.get('/mypage/modify',function(req, res){
          var sql='SELECT username, name, email, phone_num, child_old FROM users';
          conn.query(sql ,function(err, user, fields){
         if(err){
         console.log(err);
         res.status(500).send('Internal Server Error');
        }else{
           res.render('mypageModify.ejs',
           { layout:true,
            user:user,
            username:req.user.username,
            name:req.user.name,
            email:req.user.email,
            phone_num:req.user.phone_num,
            child_old:req.user.child_old
          });
     }
   });
 });

app.post('/mypage_modify', function(req, res){
    var sql ='UPDATE users SET email=?, phone_num=?, child_old=? WHERE username=?';
    var username=req.user.username;
    var email=req.body.email;
    var phone_num=req.body.phone_num;
    var child_old=req.body.child_old;
    conn.query(sql, [email, phone_num, child_old, username], function(err, result, fields){
             if(err)
             {
               console.log(err);
               res.status(500);
             }else{
                  res.redirect('/mypage_info');
                }
              });

});
app.get('/mypage_button',function(req, res){
    fs.readFile('test.txt','utf8', function(err, data){
      if(err) {
        throw err;
      }else{
      var array = data.toString().split("\n");
      console.log('-------------한줄씩 출력--------');
    //  for(i in array) {
      //  console.log(array[i]);
      res.render('mypage_button.ejs',
      { layout:true,
       hour1:array[1], hour2:array[2],hour3:array[3],hour4:array[4],hour5:array[5], hour6:array[6],
       hour7:array[7], hour8:array[8],hour9:array[9],hour10:array[10], hour11:array[11],hour12:array[12],
       hour13:array[13],hour14:array[14],hour15:array[15],hour16:array[16],hour17:array[17],hour18:array[18],
       hour19:array[19],hour20:array[20], hour21:array[21],hour22:array[22], hour23:array[23], hour24:array[24]
       });
     }
    });
});

 app.get('/upload',function(req, res){
     res.render('upload.html');
 });
 app.post('/upload', upload.single('userfile'), function(req, res){
        console.log('Uploaded : '+req.file.filename);
        res.redirect('/mypage_button');
});

app.get('/search',function(req, res){
    res.render('search.html');
});
app.get('/search_ID',function(req, res){
    res.render('search_ID.html');
});
//@2018.09.06
var check1 =" ";
var check2 =" ";
var check3 =" ";
app.post('/search_ID',function(req, res){//submit할때, post need!!
    var user=user;
    var name=req.body.name;
    var email=req.body.email;
    var phone_num=req.body.phone_num;
    if(name && email && phone_num){
         check1= name;
         check2= email;
         check3= phone_num;
         res.redirect('/search_ID_result');
       }
});

app.get('/search_ID_result', function(req, res){  //only get 방식!!
          var sql='SELECT username, name FROM users WHERE name=? AND email=? AND phone_num=?';
          conn.query(sql ,[check1, check2, check3], function(err, user, fields){
          if(err){
          console.log(err);
          res.status(500).send('error.');
        }else{
          if(user[0]) //uer에 대한 일치 여부 확인 @ _현대는 다 들어간다...
        {
        res.render('search_ID_result.ejs',
        { layout:true,
          user:user,
          username:user[0].username  // user는 잘 찍힘..(일치하지 않을 경우, user가 찍히지 x)ㅠㅠ why??
        });
        //console.log(user[0].username); test 용도
        }else{ //일치하지 않을 경우
           res.redirect('/search_ID_fail');

      }
    }
   });
});

app.get('/mypage_info',function(req, res){  //only get 방식!!
            var sql='SELECT username, name, email, phone_num, child_old FROM users';
            conn.query(sql ,function(err, user, fields){
           if(err){
           console.log(err);
           res.status(500).send('Internal Server Error');
          }else{
           res.render('mypage_info.ejs',
           { layout:true,
             user:user,
             username:req.user.username,
             name:req.user.name,
             email:req.user.email,
             phone_num:req.user.phone_num,
             child_old:req.user.child_old
           });
       }
     });
   });

app.get('/search_PW',function(req, res){
  res.render('search_PW.html');
});
app.get('/search_PW_result',function(req, res){
  res.render('search_PW_result.html');
});

var check4=" ";
var check5=" ";
var check6=" ";
var check7={};
app.post('/search_PW',function(req, res){
  var user=user;
  var username=req.body.username;
  var name=req.body.name;
  var email=req.body.email;
  if(username && name && email){
    check4 = username;
    check5= name;
    check6 = email;
  }
  var sql='SELECT email, username FROM users WHERE username=? AND name=? AND email=?';
  conn.query(sql ,[check4, check5, check6], function(err, user, fields){
  if(err){
  console.log(err);
  res.status(500).send('error.');
  }else{
    if(user[0]) //uer에 대한 일치 여부 확인 @ _현대는 다 들어간다...
    {
      check7[0] = user[0].username;
  res.redirect('/search_PW_result');
  var smtpTransport = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: "tnwls2820@gmail.com",
        pass: "rkfcl60434"
    }
  });
  var mailOptions = {
    from: '안수진 <tnwls2820@gmail.com>',
    to: user[0].email,
    subject: '비밀번호 재설정_Smart Player',

    html:
    '<h1>비밀번호 재설정_Smart Player</h1><br>'+check4+'님 안녕하세요! <br></br>인증을 하기 위해서는 하단의 링크를 클릭해주세요.</br><br><a href="http://localhost:3003/setting_PW"style="margin-left:80px;">비밀번호 재설정</a></br><p><img src="https://upload.wikimedia.org/wikipedia/commons/e/e6/Player_%28logo1%29.jpg"/></p>'
  };   //해당링크를 한번만 사용가능!!->just 변수 use함
  smtpTransport.sendMail(mailOptions, function(error, response){
    if (error){
        console.log(error);
    } else { //uer에 대한 일치 여부 확인 @ _실패시 send하지 않고, search_PW_fail 호출하기
        console.log("Message sent : " + response.message);
    }
    smtpTransport.close();
    });
  }else{ //일치하지 않을 경우
     res.redirect('/search_PW_fail');

   }
}
});
});
//@2018.09.06-------------
app.get('/setting_PW', function(req, res){
        res.render('setting_PW.html');
});
app.get('/setting_PW_result', function(req, res){ //get only_mes
        res.render('setting_PW_result.html');
});
//@2018.09.06
app.post('/setting_PW', function(req, res){
  console.log(check7[0]);
  console.log('here');

  if(check7[0]){
    hasher({password:req.body.password}, function(err, pass, salt, hash){
      var password=hash;
      var salt=salt;
    var sql ='UPDATE users SET password =?, salt =? WHERE username=?';  //Where username=? 추가 필요!_현재 username만을 보고서 수정한다_기타 요소 검사 need
    conn.query(sql, [password, salt, check7[0]], function(err, result, fields){
             if(err)
             {
               console.log(err);
               res.status(500);
             }else{
                res.redirect('/setting_PW_result');
             }
              });
              check7={};
            });


     hasher2({password:req.body.password}, function(err, pass, salt, hash){
       var password=hash;
       var salt=salt;
     var sql ='UPDATE content SET password =?, salt =? WHERE companyname=?';  //Where username=? 추가 필요!_현재 username만을 보고서 수정한다_기타 요소 검사 need
     conn.query(sql, [password, salt, check7[0]], function(err, result, fields){
              if(err)
              {
                console.log(err);
                res.status(500);
              }else{
                 res.redirect('/setting_PW_result');
              }
               });
               check7={};
             });
           }else{
               res.redirect('/main'); //direct로 접근x search_PW 한 사용자만이 비번을 change가능
           }
 });
 //@2018.09.06-----------------
app.get('/search_ID_fail', function(req, res){ //get only_me
        res.render('search_ID_fail.html');
});
app.get('/search_PW_fail', function(req, res
){ //get only_me
        res.render('search_PW_fail.html');
});


var server= app.listen(8080, function(){
  console.log('Server Start');
});
