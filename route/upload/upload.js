var express = require('express');
const fs = require('fs');
const rimraf = require('rimraf');
const fs2 = require('fs-extra');
var router = express.Router();
//ffmpg
var encoding = require('../../lib/ffmpeg');

//multer
var multer = require('multer');

//DataBase
const dbPool = require('../../lib/db');

//static
router.use(express.static("public"));

//shortId
const shortId = require('shortid');

router.get('/hls', function(request, response){
    fs.readdir('./uploads', function(error, file){

        var filename = file[0].slice(0, -4);
        console.log('filename : ', filename);
        var fileId = shortId.generate();
        console.log('userId : ', request.user.user_id);
        dbPool.getConnection(function(err, connection){ //Connection 연결
            // 디비에 저장
            connection.query(`INSERT INTO video VALUES (?,?,'C:\\Users\\lancelot\\NodeJsProjects\\videoStream\\video',?,NOW(),?,?)`, [fileId, filename,request.user.user_id,0,0], function(error, result){
                //로컬에 저장( 파일 나누기 작업)
                encoding.hls(file[0], fileId, response);
            });
        connection.release(); //Connection Pool 반환
        });
    });
});
router.get('/delete-Video', function(request, response){
    dbPool.getConnection(function(err, connection){ //Connection 연결
        connection.query(`delete from video where videoId=?`,[request.query.id], function(error, result){   
            fs2.emptyDirSync(`./videos/${request.query.id}`);
            fs.rmdir(`./videos/${request.query.id}`, function(error){
                response.redirect('/');
            });
        });
        connection.release(); //Connection Pool 반환
    });
});
router.get('/upload', (request, response) =>{
    dbPool.getConnection(function(err, connection){ //Connection 연결
        connection.query(`select * from video`, function(error, result){
            if(request.user){
                response.render('../public/views/upload.ejs', {request : request});
            }else{
                response.redirect('/auth/login');
            }
        });
        connection.release(); //Connection Pool 반환
    });
});
router.post('/upload-process',function(req, res){
    let storage = multer.diskStorage({
        destination: (req, file, done) => {
            done(null, './uploads'); //uploads라는 폴더에 file을 저장
          },
          filename: (req, file, done) => {
            done(null, `${req.body.title}.mp4`);
            //파일 이름
          },
          fileFilter: (req, file, done) => {
            const ext = path.extname(file.originalname);
            if (ext !== ".mp4" || ext !== '.wmv') {
              //파일확장자는 mp4만허용 추가하고싶다면 || ext !== '.wmv' 와같이가능
              return done(res.status(400).end("only mp4 is allowd"), false);
            }
            done(null, true);
          }
    });
    //파일하나만업로드하겠다는의미
    const upload = multer({ storage: storage }).single("file");

    // 비디오를 서버에 저장한다.
    upload(req, res, function(err){
        console.log(req.body.title);
        if (err) {
            return res.json({ success: false, err });
        }

        res.redirect('/uv/hls');
        //파일 저장 후 프로세스
        // return res.json({
        //     success: true,
        //     url: res.req.file.path, //파일을 저장하게되면 uploads폴더안에 저장되게되는데 그경로를 보내줌
        //     fileName: res.req.file.filename,
        // });
    });
});

module.exports = router;