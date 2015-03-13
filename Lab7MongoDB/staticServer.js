var fs = require('fs');
var http = require('http');
var url = require('url');
var debug = require('debug');
var assert = require('assert');
var ROOT_DIR = "/home/ec2-user/public_html";

http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  var path=urlObj.pathname;
  if (path=="/") {
    path="/index.html";
  }
  if (urlObj.pathname.indexOf("comment") !=-1) {
    console.log("comment route");
    if(req.method === "POST") {
      console.log("POST comment route");
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
          MongoClient.connect("mongodb://localhost", function(err, db) {
            if(err) { console.log("Failed connection"); throw err; }
            db.authenticate("dbuser","1h@v3power",function(err, authRes) {
              if(err) { console.log("Failed authentication"); throw err; }
                var weatherDb = db.db("weather");
                  assert(!null,weatherDb);
                  weatherDb.collection('comments').insert(reqObj,function(err, records) {
                  if(err) { console.log("Failed insert"); throw err; }
                  console.log("Record added as "+records[0]._id);
                });
              });
          });
        res.writeHead(200);
        res.end("");
      });
    } else if (req.method === "GET") {
      console.log("In GET"); 
      if(urlObj.pathname.indexOf("comment") !=-1) {
         // Now put it into the database
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
                  res.writeHead(200);
                  res.end(JSON.stringify(itemArr));
                  });
                });
              });
          });
      }
    }
  } else if(urlObj.pathname.indexOf("getcity") !=-1) {
   // Execute the REST service 
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

 } else {
  
  fs.readFile(ROOT_DIR + path, function (err,data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }
    res.writeHead(200);
    res.end(data);
  });
  }
}).listen(80);

/*
var options = {
    hostname: 'localhost',
    port: '80',
    path: '/test1.html'
  };
function handleResponse(response) {
  var serverData = '';
  response.on('data', function (chunk) {
    serverData += chunk;
  });
  response.on('end', function () {
    console.log(serverData);
  });
}
http.request(options, function(response){
  if (response.err) {
    console.log(response.err);
    return;
  }
  handleResponse(response);
}).end();
*/
