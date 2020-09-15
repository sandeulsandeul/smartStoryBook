module.exports =function(app){
var conn = require('./Database')(); //./은 같은 폴더상에 존재시에
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var bkfd2Password = require("pbkdf2-password");
var hasher = bkfd2Password();

  app.use(passport.initialize());
  app.use(passport.session());
  passport.serializeUser(function(user, done) {
    console.log('serializeUser', user);
    done(null, user.authId);
  });
   /*----login기능(mysql)_ 수정하기--*/
  passport.deserializeUser(function(id, done) {
    console.log('deserializeUser', id);
    var sql='SELECT * FROM users WHERE authId=?';
    conn.query(sql, [id],function(err, results){
      if(err)
      {
        cosole.log(err);
         done('There is no users.');
      }else{
        done(null, results[0]);
      }
    });
  });
/*  passport.deserializeUser(function(obj, done) {   //잘알되서 이것으로 변경함.
  done(null, false);  // invalidates the existing login session.
});*/
  /*----login기능(mysql)_ localStrategy -> mysql화하기---*/
  passport.use(new LocalStrategy(
    function(username, password, done){
      var uname = username;
      var pwd = password;
      var sql = 'SELECT * FROM users WHERE authId=?';
      conn.query(sql,['local:'+ uname],function(err, results){ //callback함수
        if(err)
        {
          return done('There is no user.');
        }
        var user =results[0]; //배열의 값을 user에 저장하고,
        return hasher({password:pwd, salt:user.salt}, function(err, pass, salt, hash){
          if(hash === user.password){ //일치_정상적인 사용자
            console.log('LocalStrategy', user);
            done(null, user);
          } else {//불일치_ 비정상적인 사용자
            done(null, false);
          }
        });
      });
    }
  ));
  passport.use(new FacebookStrategy({
      clientID: '1602353993419626',
      clientSecret: '6c7c3f6563511116dbc13b06f81a3985',
      callbackURL: "/facebook/callback",
      profileFields:['id', 'email', 'gender', 'link', 'locale', 'name', 'timezone', 'updated_time', 'verified', 'name']
    },
    function(accessToken, refreshToken, profile, done) {
      console.log(profile);
      var authId = 'facebook:'+profile.id;
      var sql ='SELECT * FROM users WHERE authId=?';
      conn.query(sql, [authId],function(err, results){
        if(results.length >0)   //기존의 facebook 사용자가 있으면
        {
          done(null, results[0]);
        }else{//기존의 facebook 사용자가 없으면, 추가하기
          var newuser = {
            'authId':authId,
            'name':profile.name,
            'email':profile.emails[0].value
          };
          var sql = 'INSERT INTO users SET ?';
          conn.query(sql, [], function(err, results){
            if(err){
              console.log(err);
              donhe('Error');
            }else{
              done(null,newuser);
            }
          })
        }
      });
    }
  ));
  return passport;
}
