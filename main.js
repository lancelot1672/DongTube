const express = require('express');
const app = express();
const fs = require('fs');
const hls = require('hls-server');

var upload = require('./lib/upload');
var auth = require('./lib/auth');

//DataBase
var db = require('./lib/db');

//  body-parser || Express v4.16.0 기준으로 express.js에서 자체 제공하기 때문에 따로 import 할 필요가 없다.
app.use(express.json());
app.use(express.urlencoded({extended : true}));

//ejs
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

//static
app.use(express.static("public"));

//session
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);

//session MySQL
app.use(session({
    secret : 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store:new MySQLStore({
      host : 'localhost',
      port:3306,
      user:'root',
      password:'111111',
      database:'opentutorials'
    })
  }));

// passport
var passport = require('passport'), LocalStrategy = require('passport-local').Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done){
    console.log('serializeUser : ', user.user_id);
    done(null, user);
  });
passport.deserializeUser(function(user, done){
    console.log('deserializeUser : ', user);
    done(null, user);
});

passport.use(new LocalStrategy(
    {
        usernameField: 'user_id',
        passwordField: 'user_pw'
    },
    function(username, password, done){
        console.log('LocalStrategy', username, password);
        db.query(`select count(*) as idCount from opentutorials.member where user_id=? and user_pw=?`,[username, password],function(error, result){
        if(error){
            throw error;
        }

        if(result[0].idCount === 1){
            if(error){
                throw error;
            }
            db.query(`select * from opentutorials.member where user_id=? and user_pw=?`,[username, password],function(error2, result2){
                //passport.serializeUser에 전송
                return done(null, result2[0]);
            });

        }else{
        return done(null, false, {
            message : 'Incorrect userInfo.'
        });
        }
    });
    }
));

//upload.js
app.use('/uv', upload);

//auth.js
app.use('/auth',auth);

app.post('/auth/login_process', passport.authenticate('local', {
//successRedirect : '/',
failureRedirect : '/auth/login'
}),
function(request, response){
    request.session.save(function(){
    response.redirect('/');
    })
});

app.get('/watch', (request, response) => {
    var videoId = request.query.v;
    db.query(`select title, author, DATE_FORMAT(upload_date, '%Y.%m.%d.') as upload_date, watch_count, like_count from video where videoId=?`,[videoId],function(error, result){
        var title = result[0].title;
        var author = result[0].author;
        var date = result[0].upload_date;
        var c_data;
        console.log(date);
        db.query('select * from comment where v_Id=?',[videoId], function(err, result3){
            c_data = result3;
            if(result3.length != 0){
                console.log(result3);
            }
            db.query('update video set watch_count = watch_count + 1 where videoId=?',[videoId], function(err, result2){
                response.render(__dirname + '/public/views/watch.ejs', {videoId : videoId, title : title, author : author, data: result, request : request, c_data : c_data});
            });
        });
        
    });
 });
app.post('/comment', function(request, response){
    var data = request.body.data;
    console.log('data : ', data);
    // console.log('comment :',data.comment);
    // console.log('videoId :',data.videoId);

    response.send({result : 'success'});
});
app.get('/', function(request, response){
    var title = "DongTube";
    console.log("user : ", request.user);

    db.query(`select * from video`, function(error, result){
        //console.log(result);
        //var videoList = template.list(result);
        // var html = template.HTML(title, videoList, `<a href='/upload'>upload</a>`,``,``);
        // response.send(html);
        response.render(__dirname + '/public/views/main.ejs', {title : title, list : result, request});
    }); 
});

const server = app.listen(3000);

new hls(server, {
    provider: {
        exists: (req, cb) => {
            const ext = req.url.split('.').pop();

            if (ext !== 'm3u8' && ext !== 'ts') {
                return cb(null, true);
            }

            fs.access(__dirname + req.url, fs.constants.F_OK, function (err) {
                if (err) {
                    console.log('File not exist');
                    return cb(null, false);
                }
                cb(null, true);
            });
        },
        getManifestStream: (req, cb) => {
            const stream = fs.createReadStream(__dirname + req.url);
            cb(null, stream);
        },
        getSegmentStream: (req, cb) => {
            const stream = fs.createReadStream(__dirname + req.url);
            cb(null, stream);
        }
    }
});