const express = require("express");
const router = express.Router();
 
router.get('/', function(req, res){
    req.MySession.username = "Unknown";
    res.render('loginpage', {layout: false});
})

module.exports = router;