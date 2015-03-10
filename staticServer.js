var fs = require('fs');
var http = require('http');
var https = require('https');
var url = require('url');

var ROOT_DIR = "public_html";


http.createServer(function (req, res) {
  var urlObj = url.parse(req.url, true, false);
  var path=urlObj.pathname;
  if (path=="/") {
    path="/index.html";
  }
  if(urlObj.pathname.indexOf("getcity") !=-1) {
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