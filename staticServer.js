var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require('url');
var debug = require('debug');
var assert = require('assert');
var express = require('express'), jade = require('jade'),
    ejs = require('ejs'), bodyParser = require('body-parser');
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
var ROOT_DIR = "/home/ec2-user/public_html";

var options = {
    hostname: 'localhost',
    host: '127.0.0.1',
    key: fs.readFileSync('ssl/server.key'),
    cert: fs.readFileSync('ssl/server.crt')
  };

http.createServer(app).listen(80);
https.createServer(options, app).listen(443);
app.get('/',function(req, res) {
  res.sendFile(ROOT_DIR+"/index.html");
});
app.use('/', express.static(ROOT_DIR, {maxAge: 60*60*1000}));
var basicAuth = require('basic-auth-connect');
var auth = basicAuth(function(user, pass) {
    return((user ==='cs360')&&(pass === 'test'));
});

app.get('/getcity', function (req, res) {
  var urlObj = url.parse(req.url, true, false);
    var myRe = new RegExp("^"+urlObj.query["q"]);
   fs.readFile('cities.dat.txt', function (err, data) {
    if(err) throw err;
    cities = data.toString().split("\n");
    
    var citiesFiltered=[];
    for(var i = 0; i < cities.length; i++) {
      var result = cities[i].search(myRe);
      if(result != -1) {
        citiesFiltered.push({city:cities[i]});
      }
    }
    res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
    });

    res.end(JSON.stringify(citiesFiltered));
    });
});

app.get('/comment', function (req, res) {
    console.log("In comment route");
    var MongoClient = require('mongodb').MongoClient;
          var Db = require('mongodb').Db;
          var Server = require('mongodb').Server;
          MongoClient.connect("mongodb://localhost", function(err, db) {
            if(err) { console.log("Failed connection"); throw err; }
            db.authenticate("dbuser","1h@v3power",function(err, authRes) {
              if(err) { console.log("Failed authentication"); throw err; }
                var weatherDb = db.db("weather");
                  assert(!null,weatherDb);
                  weatherDb.collection('comments').find(function(err, items) {
                  if(err) { console.log("Failed read"); throw err; }
                  items.toArray(function(err, itemArr){
                  console.log("Document Array: ");
                  console.log(itemArr);
                  res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
    });
                  res.end(JSON.stringify(itemArr));
                  });
                });
              });
          });
  });
  app.post('/comment', auth, function (req, res) {
    console.log("In POST comment route");
    console.log(req.body);
           var jsonData = "";
      req.on('data', function (chunk) {
        jsonData += chunk;
      });
      req.on('end', function () {
        var reqObj = JSON.parse(jsonData);
        console.log(reqObj);
         // Now put it into the database
          var MongoClient = require('mongodb').MongoClient;
          var Db = require('mongodb').Db;
          var Server = require('mongodb').Server;
          console.log("Before connecting");
          MongoClient.connect("mongodb://localhost", function(err, db) {
            if(err) { console.log("Failed connection"); throw err; }
            console.log("connected");
            db.authenticate("dbuser","1h@v3power",function(err, authRes) {
              if(err) { console.log("Failed authentication"); throw err; }
              console.log("authenticated");
                var weatherDb = db.db("weather");
                  assert(!null,weatherDb);
                  weatherDb.collection('comments').insert(reqObj,function(err, records) {
                  if(err) { console.log("Failed insert"); throw err; }
                  console.log("Record added as "+records[0]._id);
                });
              });
          });
         res.writeHead(200, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
    });
        res.end("");
      });
  });