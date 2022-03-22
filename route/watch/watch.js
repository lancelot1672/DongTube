var express = require('express');
var router = express.Router();

//DataBase
var dbPool = require('../../lib/db');

router.get('/', (request, response) => {
    var videoId = request.query.v;
    dbPool.getConnection(function(err, connection){ //Connection 연결
        connection.query(`select title, author, DATE_FORMAT(upload_date, '%Y.%m.%d.') as upload_date, watch_count, like_count from video where videoId=?`,[videoId],function(error, result){
            var title = result[0].title;
            var author = result[0].author;
            var date = result[0].upload_date;
            var c_data;
            connection.query('select * from comment where v_Id=?',[videoId], function(err, result3){
                c_data = result3;
                if(result3.length != 0){
                    console.log(result3);
                }
                connection.query('update video set watch_count = watch_count + 1 where videoId=?',[videoId], function(err, result2){
                    response.render('../public/views/watch.ejs', {videoId : videoId, title : title, author : author, data: result, request : request, c_data : c_data});
                });
            });
        });
        connection.release(); //Connection Pool 반환
    });
 });

 module.exports = router;