var express = require('express');
var router = express.Router();

router.get('/login',  function(request, response){
    response.render('../public/views/login.ejs', {request:request});
});
router.get('/logout', function(request, response){
    request.session.destroy(function(){
        response.redirect('/');
    });
})
module.exports = router;