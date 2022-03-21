module.exports = {
    hls: function(file, fileId, response){
        const ffmpeg = require('fluent-ffmpeg');
        const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
        const fs = require('fs');
        ffmpeg.setFfmpegPath(ffmpegInstaller.path);
        
        // var file = 'OneRepublic - Lose Somebody (One Night in Malibu).mp4';
        // var fileId = 'EhV6m3vDp';
        fs.mkdir(`./videos/${fileId}`, {recursive: true}, function(error){
            if(error) throw error;
            ffmpeg(`uploads/${file}`, { timeout: 432000 }).addOptions([
                '-profile:v baseline',
                '-level 3.0',
                '-start_number 0',
                '-hls_time 10',
                '-hls_list_size 0',
                '-f hls'
            ]).output(`videos/${fileId}/${fileId}.m3u8`).on('end', () => {
                //동튜브 업로드 완료
                console.log('end');

                //업로드한 파일 삭제
                fs.unlink(`uploads/${file}`, function(error){
                    response.redirect('/');
                });
            }).run();
        });
    }
}