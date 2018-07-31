/**
 * Author: Gery Casiez
 *
 */

var express = require('express')
var mysql = require('mysql');
var fs = require('fs');
const port = 3000

var pool      =    mysql.createPool({
    connectionLimit : 100,
    multipleStatements: true,
    host     : 'localhost',
    port     :  3306,
    user     : 'fitts',
    password : 'Paul2018',
    database : 'FittsExperiment',
    debug    :  false
});

var app = require('http').createServer(handler);
var io = require('socket.io').listen(app);

app.listen(port);
datelog('Server listening on port '+port+'.');

function addZ(n) {
    return n<10?'0'+n:''+n;
}

function datelog(string) {
    var date = new Date();
    console.log("[" + date.getFullYear() + "-" + addZ(date.getMonth()+1) + "-" + addZ(date.getDate()) + " " + addZ(date.getHours()) + ":" + addZ(date.getMinutes()) + "] " + string);
}

function handler (req, res) {
    // console.log(__dirname);
    // console.log(req.url);
    var url = req.url;
    if (url == '/') { url = '/index.html'; }
    fs.readFile(__dirname + url,

    function (err, data) {
        if (err) {
            res.writeHead(500);
            return res.end('Error loading URL '+url);
        }
        res.writeHead(200);
        res.end(data);
    });
}

var clients = {};

function displayListOfCurrentClients() {
    datelog("List of currently connected clients:");
    for (var key in clients) {
        datelog("  |-> Socket: '"+key+"' is connected.");
    }
}

io.sockets.on('connection', function (socket) {
    datelog("New client connection");

    socket.emit('connected', socket.id);
    clients[socket.id] = {};
    displayListOfCurrentClients();

    socket.emit('trials', generateTrials());

    socket.on('results', function (data) {
      results = JSON.parse(data);
      saveResults(results)
      //console.log(results);
    });

	socket.on('disconnect' , function() {
		datelog("Client '"+clients[socket.id]+"'disconnected");
		delete clients[socket.id];
		displayListOfCurrentClients();
	});
});

function generateTrials() {
	var d = [0.4, 0.8];
	var w = [0.025];
	var o = [0, 180, 30, 210, 60, 240, 90, 270, 120, 300, 150, 330];
	var trials = [];

	for (var i = 0; i < d.length; i++) {
		for (var j = 0; j < w.length; j++) {
			for (var k = 0; k < o.length; k++) {
				var expe_break = (i>0 && k==0) ? true : false;
				trials.push({d: d[i], w: w[j], o: o[k], b: expe_break});
			}
		}
	}
	//console.log(trials);
	return JSON.stringify(trials);
}

function saveResults(data) {
	var query = "INSERT INTO results (hash, res) VALUES ('" + data.id + "', '" + JSON.stringify(data) + "')";
    pool.getConnection(function(err,connection) {
        if (err) { datelog(err); return; }

        connection.query(query, function(err,rows) {
            connection.release();
            if(!err) {

            } else {
                datelog(query);
                datelog(err);
                return;
            }
        });
    });
}

