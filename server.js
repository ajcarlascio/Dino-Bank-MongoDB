'use strict';
//author: Anthony Carlascio
const HTTP_PORT = process.env.PORT || 3000;
var http = require('http');
var fs = require('fs')
var express = require("express");
var bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
var path = require("path");
var cookieParser = require('cookie-parser');
const session = require("client-sessions");
const randomStr = require("randomstring");
const { assert } = require('console');
const MongoClient = require("mongodb").MongoClient;	
const app = express();
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.engine("hbs", exphbs({ extname: "hbs" }));                              

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.use(express.static('views/images')); 
//place database name in place of <dbname>
const dbUrl = "<dbname>"

const mw = require('./routes/mw.js');

//var accounts = new Object();
var accounts = JSON.parse(fs.readFileSync('./accounts.json'));
var uName;
var strRandom = randomStr.generate();
var accountNo;
var dbAccess;
///////////////////////////////////////COOOOOOOOKIES////////////////////////////////////////////
app.use(session({
    cookieName: "MySession",
    secret: strRandom,
    duration: 5 * 60 * 1000,
    activeDuration: 1 * 60 * 1000,
    secure: true,
}));

///////////////////////////////////THE ONLY GET///////////////////////////////////////////////

app.use("/", mw);

/*app.get("/", (req, res) => {
    req.MySession.username = "Unknown";
    res.render('loginpage', {layout: false});
    var placeHolderValue = {usernamefromcookie: "TBD"};
});*/

///////////////////////////ROOT POST BEGINGS HERE///////////////////////////////////////////// 

var userObj = JSON.parse(fs.readFileSync('./user.json'));

app.post("/", (req, res) => {
    
    //var userObj = JSON.parse(fs.readFileSync('./user.json'));
    var inputdata1 = req.body.username;
    var inputdata2 = req.body.password;
    uName = inputdata1;

    userObj.hasOwnProperty(inputdata1) || res.render('loginpage', {layout: false , data : {errormessage1 : "Invalid Username"}});
    userObj[inputdata1] === inputdata2 || res.render('loginpage', {layout: false , data : {errormessage2 : "Invalid Password"}});
    
    if (userObj.hasOwnProperty(inputdata1)) {

        if (userObj[inputdata1] === inputdata2) 
        {
            req.MySession.user = {username: req.body.username};

            MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
                if (err) throw err;
                var db = client.db("Assignment3");
                db.collection('Client Collection', function (err, collection) {
                    collection.find({Username: inputdata1}).toArray(function(err, result){
                        dbAccess = result;
                        console.log(result);
                        //console.log(dbAccess);
                        //console.log(result);
                        res.render('userpage', {
                            layout: false,
                            data: req.MySession.user,
                            dbData: dbAccess[0]//dbAccess[0] // if running into trouble then change to dbAccess[0]
            
                        });
                    })})});

            

        }
}
});

////////////////////////////////////ALL OTHER POSTS BELOW////////////////////////////////////////////////////////////
app.post("/user", (req, res) => {
    var choice = req.body.options;
    accountNo = req.body.accounts;
        switch(choice)
        {
            case "account":
                res.render('createaccountpage', {
                    layout: false,
                    data: req.MySession.user,
                    //data: accountNo
                })
                break;

                case "balance":
                    MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
                        if (err) throw err;
                        var db = client.db("Assignment3");
                        db.collection('Client Collection', function (err, collection) {
                            collection.find({Username: uName}).toArray(function(err, result){
                                dbAccess = result;
                                console.log(result);
                                //console.log(dbAccess);
                                //console.log(result);
                                res.render('balancepage', {
                                    layout: false,
                                    data: req.MySession.user,
                                    dbData: dbAccess[0],//dbAccess[0] // if running into trouble then change to dbAccess[0]
                                    Account: accountNo
                                });
                            })})});
                    break;

                    case "deposit":
                        res.render('depositpage', {
                            layout: false,
                            data: req.MySession.user,
                            dbData: accountNo
                        });
                    
                        break;

                        case "withdrawl":
                            res.render('withdrawlpage', {
                                layout: false,
                                data: req.MySession.user,
                                dbData: accountNo
                            });
                            break;

                            default:
                                MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
                                    if (err) throw err;
                                    var db = client.db("Assignment3");
                                    db.collection('Client Collection', function (err, collection) {
                                        collection.find({Username: uName}).toArray(function(err, result){
                                            dbAccess = result;
                                            console.log(result);
                                            //console.log(dbAccess);
                                            //console.log(result);
                                            res.render('userpage', {
                                                layout: false,
                                                data: req.MySession.user,
                                                dbData: dbAccess[0]//dbAccess[0] // if running into trouble then change to dbAccess[0]
                                            });
                                        })})});
        }
});

app.post("/balance", (req, res) =>{


    MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("Assignment3");
        db.collection('Client Collection', function (err, collection) {
            collection.find({Username: uName}).toArray(function(err, result){
                dbAccess = result;
                console.log(result);
                //console.log(dbAccess);
                //console.log(result);
                res.render('userpage', {
                    layout: false,
                    data: req.MySession.user,
                    dbData: dbAccess[0]//dbAccess[0] // if running into trouble then change to dbAccess[0]
                });
            })})});
})

app.post("/withdraw", (req, res) =>{
    var withd = req.body.withd;
    var number = req.body.Number;

    MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("Assignment3");
        db.collection('Client Collection', function (err, collection) {
            collection.update({Username: uName}, {$inc: {Balance: -withd}});
            collection.find({Username: uName}).toArray(function(err, result){
                dbAccess = result;
                console.log(result);
                res.render('userpage', {
                    layout: false,
                    data: req.MySession.user,
                    dbData: dbAccess[0]//dbAccess[0] // if running into trouble then change to dbAccess[0]
                });
            })})});
})

app.post("/account", (req, res) =>{
    var choice = req.body.options;
    var Number = req.body.accountNo;
    switch(choice){
        case "Savings":
        MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("Assignment3");
        db.collection('Client Collection', function (err, collection) {
            collection.update({Username: uName}, {$set: {Savings: Number}})
            collection.find({Username: uName}).toArray(function(err, result){
                dbAccess = result;
                console.log(result);
                //console.log(dbAccess);
                //console.log(result);
                res.render('userpage', {
                    layout: false,
                    data: req.MySession.user,
                    dbData: dbAccess[0]//dbAccess[0] // if running into trouble then change to dbAccess[0]
                });
            })})});
            break;
            case "Chequings":
                MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
                    if (err) throw err;
                    var db = client.db("Assignment3");
                    db.collection('Client Collection', function (err, collection) {
                        collection.update({Username: uName}, {$set: {Chequing: Number}})
                        collection.find({Username: uName}).toArray(function(err, result){
                            dbAccess = result;
                            console.log(result);
                            //console.log(dbAccess);
                            //console.log(result);
                            res.render('userpage', {
                                layout: false,
                                data: req.MySession.user,
                                dbData: dbAccess[0]//dbAccess[0] // if running into trouble then change to dbAccess[0]
                            });
                        })})});
            break;
            default:
                MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
                    if (err) throw err;
                    var db = client.db("Assignment3");
                    db.collection('Client Collection', function (err, collection) {
                        collection.find({Username: uName}).toArray(function(err, result){
                            dbAccess = result;
                            console.log(result);
                            //console.log(dbAccess);
                            //console.log(result);
                            res.render('userpage', {
                                layout: false,
                                data: req.MySession.user,
                                dbData: dbAccess[0]//dbAccess[0] // if running into trouble then change to dbAccess[0]
                            });
                        })})});

        }
})

app.post("/deposit",(req, res) =>{
    var number = req.body.Number;
    var depo = req.body.depo;

    MongoClient.connect(dbUrl, { useNewUrlParser: true, useUnifiedTopology: true }, function (err, client) {
        if (err) throw err;
        var db = client.db("Assignment3");
        db.collection('Client Collection', function (err, collection) {
            collection.update({Username: uName}, {$inc: {Balance: +depo}});
            collection.find({Username: uName}).toArray(function(err, result){
                dbAccess = result;
                console.log(result);
                res.render('userpage', {
                    layout: false,
                    data: req.MySession.user,
                    dbData: dbAccess[0]//dbAccess[0] // if running into trouble then change to dbAccess[0]
                });
            })})});
})

app.post("/log", (req,res) => {
    res.render('loginpage', {layout: false});
})

var server = app.listen(HTTP_PORT, function () {
    console.log(`Listening on port ${HTTP_PORT}`);
});


