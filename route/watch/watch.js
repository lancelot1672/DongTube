const e = require('express');
var express = require('express');
var router = express.Router();

//DataBase
var dbPool = require('../../lib/db');

router.get('/', (request, response) => {
    var videoId = request.query.v;
    dbPool.getConnection(function(err, connection){ //Connection 연결
        connection.query(`select title, author, DATE_FORMAT(upload_date, '%Y.%m.%d.') as upload_date, watch_count, like_count from video where videoId=?`,[videoId],function(error, result){
            var like = false;
            var c_data;
            if(request.user){  //user정보가 있으면
                var user_id = request.user.user_id;
                //비디오의 좋아요 정보 true이면 좋아요 했던 것, false이면 좋아요 안한 것
                connection.query(`select * from v_like where user_id=? and v_id=?`,[user_id, videoId],function(err1, result1){
                    if(!result1[0]){
                        like = false;
                    }else{
                        if(result1[0].u_like === 1){
                            like = true;
                        }else{
                            like = false;
                        }
                    }
                });
            }
       
            connection.query(`select user_name, description, DATE_FORMAT(add_date, '%Y.%m.%d.') as add_date from comment where v_Id=? order by vGroup desc`,[videoId], function(err, result3){
                c_data = result3;
                if(result3.length != 0){
                    console.log(result3);
                }
                connection.query('update video set watch_count = watch_count + 1 where videoId=?',[videoId], function(err, result2){
                    response.render('../public/views/watch.ejs', {videoId : videoId, v_data: result, like : like,request : request, c_data : c_data});
                });
            });
        });
        connection.release(); //Connection Pool 반환
    });
 });

 module.exports = router;