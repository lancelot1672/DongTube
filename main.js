const express = require('express');
const app = express();
const fs = require('fs');
const hls = require('hls-server');

var upload = require('./route/upload/upload');
var auth = require('./route/auth/auth');
var watch = require('./route/watch/watch');

//MySQL Connection Pool
const dbPool = require('./lib/db');

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
const config = require('./lib/db_config.json');
app.use(session({
    secret : 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store:new MySQLStore(config)
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
        dbPool.getConnection(function(err, connection){ //Connection 연결
            connection.query(`select count(*) as idCount from opentutorials.member where user_id=? and user_pw=?`,[username, password],function(error, result){
            if(error){
                throw error;
            }

            if(result[0].idCount === 1){
                if(error){
                    throw error;
                }
                connection.query(`select * from opentutorials.member where user_id=? and user_pw=?`,[username, password],function(error2, result2){
                    //passport.serializeUser에 전송
                    return done(null, result2[0]);
                });

            }else{
                return done(null, false, {
                    message : 'Incorrect userInfo.'
                    });
                }
            });
            connection.release(); //Connection Pool 반환
        });
    }   
));

//upload.js
app.use('/uv', upload);

//auth.js
app.use('/auth',auth);

//watch.js
app.use('/watch', watch);

app.post('/auth/login_process', passport.authenticate('local', {
//successRedirect : '/',
failureRedirect : '/auth/login'
}),
function(request, response){
    request.session.save(function(){
    response.redirect('/');
    })
});


app.get('/comment', function(request, response){
    var data = request.query;
    var videoId = data.videoId;
    var user_id;
    if(request.user){
        user_id = request.user.user_id;
    }else{
        //오류 대비 - 로그인 페이지 이동
        response.send();
    }
    dbPool.getConnection(function(err, connection){ //Connection 연결
        // 그룹에서의 제일 큰 값 + 1 그룹에 새 댓글 저장.
        connection.query('select max(vGroup) as vGroup from comment where v_id=?',[videoId], function(err1, result1){
            if(err1){

            }
            var vGroup = result1[0].vGroup + 1;     //그룹에서의 제일 큰 값 + 1
            console.log('vGroup : ', vGroup);
            console.log('id : ', user_id);
            connection.query(`insert into comment (c_index, v_id, vGroup, vStep, vIndent, description, like_count, user_name) VALUES(DEFAULT,?,?,0,0,?,1,?)`
                ,[videoId, vGroup, data.comment, user_id], function(err2, result2){
                if(err2){
                    throw err2;
                }
                //response.send({result : 'success'})
                connection.query('select * from comment where v_id=?',[videoId], function(err3, result3){
                    if(err3){
                    }
                    response.send({result : result3});
                    
                });
            });
        });
        connection.release(); //Connection Pool 반환
    });
});
app.get('/', function(request, response){
    var title = "DongTube";
    console.log("user : ", request.user);
    dbPool.getConnection(function(err, connection){ //Connection 연결
        connection.query(`select * from video`, function(error, result){
        //console.log(result);
        //var videoList = template.list(result);
        // var html = template.HTML(title, videoList, `<a href='/upload'>upload</a>`,``,``);
        // response.send(html);
        response.render(__dirname + '/public/views/main.ejs', {title : title, list : result, request});
        });
        connection.release(); //Connection Pool 반환
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