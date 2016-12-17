// Load Express framework
var express = require("express");
var app = express();

// Load Uniform
var validator = require("uniform-validation");

// Serve the www/ directory to clients
app.use(express.static("www"));

// Serve the client-side library to /uniform.js
app.get("/uniform.js", function (req, res) {
    validator.getClientLib().then(function (lib) {
	res.end(lib);
    });
});

// On POST to /submit, validate with Uniform
app.post("/submit", validator("www/car.ufm"), function (req, res) {
    var result = req.ufmResult;
    var output;
    
    if (!result.hasCar) {
	output = "User does not own a car."
    } else {
	var car = result.car;
	output = "User owns a " + car.myYear + " " + car.myMake
	    + " " + car.myModel + ".";
    }
    
    console.log(output);
    res.end("Valid :)");
}, function (err, req, res, next) {
    res.end("Invalid :(");
    console.error(err);
});

// Listen on port 8000
app.listen(8000, function () {
    console.log("Started server. View it at http://localhost:8000");
});
