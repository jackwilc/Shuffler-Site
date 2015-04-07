var express = require('express'),
    path = require('path'),
    swig = require('swig'),
    http = require('http'),
    methodOverride = require('method-override'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    app = express(),
    minify = require('express-minify'),
    io = require('socket.io'),
    server = http.createServer(app),
    compression = require('compression'),
    people,
    expressSession = require('express-session'),
    mysql      = require('mysql'),
    connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Tigger9496',
    port: 3306,
    database: 'shuffler'
});

var HashMap = require('hashmap').HashMap;
var map = new HashMap();

var myCookieParser = cookieParser('secret');
var sessionStore = new expressSession.MemoryStore();

connection.connect();

io = io.listen(server);

app.engine('html', swig.renderFile);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(myCookieParser);
app.use(expressSession({ secret: 'secret', store: sessionStore, saveUninitialized: true, resave: true }));
app.use(express.static(__dirname + '/public'));

var SessionSockets = require('session.socket.io')
    , sessionSockets = new SessionSockets(io, sessionStore, myCookieParser);


app.get('/', function (req, res) {
    res.render('index', {});
});

app.get('/home', function (req, res) {
    res.render('home');
});

app.get('/host', function (req, res) {
    res.render('host');
});

app.get('/join', function (req, res) {
    res.render('join');
});

app.get('/session', function (req, res) {
    res.render('session');
});

app.get('*', function(req, res){
    res.redirect('/');
});

sessionSockets.on('connection', function (err, socket, session) {

socket.on('add_track',function(data){

        var room = map.get(socket.id);

        console.log(room.name);

        console.log('Track Source:' + data.track_source + 'track id:' + data.track_id + 'name:' + data.name + 'artist:' + data.artist + 'art:' + data.art);
        
        connection.query('INSERT INTO tracks (source, source_id, added_by, session_id, title, artist, artwork, permalink) VALUES (' + connection.escape(data.track_source) + ',' + connection.escape(data.track_id) + ',' + connection.escape(socket.id) + ',' + room.id + ',' + connection.escape(data.name) + ',' + connection.escape(data.artist) + ',' + connection.escape(data.art) + ',' + connection.escape(data.permalink) + ')', function(err, result) { 

            if (!err){ 
            io.sockets.in(room.name).emit('queue_add',{track_source: 'source', track_id: result.insertId, track_art: data.art, track_name: data.name, track_artist: data.artist});
        }
        else
        {
            console.log('there was a mysql error!' + err.code);
        }

        });

});

socket.on('vote',function(data){

    var room = map.get(socket.id);

    if(data.up){
    connection.query('UPDATE tracks SET rating = rating + 1 WHERE id = ' + data.id + ' AND session_id = ' + room.id, function(err, rows, fields) {

    });
} else{
    connection.query('UPDATE tracks SET rating = rating - 1 WHERE id = ' + data.id + ' AND session_id = ' + room.id, function(err, rows, fields) {

    });
}


});

socket.on('request_next',function(data){

    var room = map.get(socket.id);

    connection.query('SELECT * FROM tracks WHERE status = 0 AND session_id = ' + room.id + ' ORDER BY rating DESC, added', function(err, rows, fields) {
    
    if(rows.length == 0){

        socket.emit('try_again');

    }else{
        
        socket.emit('next_track', {'track': rows[0]});

        io.sockets.in(room.name).emit('queue_remove',{ 'id':rows[0].id });

        connection.query('SELECT * FROM tracks WHERE status = 1 AND session_id = ' + room.id, function(err, rows, fields) {

            io.sockets.in(room.name).emit('history_add', {'track': rows[0]});

        });

        connection.query('UPDATE tracks SET status = 2 WHERE status = 1 AND session_id = ' + room.id, function(err, rows, fields) {

        });

        connection.query('UPDATE tracks SET status = 1 WHERE id = ' + rows[0].id, function(err, rows, fields) {

        });




    }
    });

});

socket.on('create_session',function(data){

    var sessionname = data.sessionname;
    var pwd = data.pwd;
    var pwdcheck = data.pwdcheck;

    console.log(data);

    if(pwdcheck == true){
        pwdcheck = 1;
    }else{
        pwdcheck = 0;
        pwd = '';
    }

    connection.query('SELECT * FROM session WHERE name = ' + connection.escape(sessionname), function(err, rows, fields) {
    
    if(rows.length == 0){

        connection.query('INSERT INTO session (name,protected,pwd) VALUES (' + connection.escape(sessionname) + ',' + connection.escape(pwdcheck) + ',' + connection.escape(pwd) + ')', function(err, result) {
        

        if (!err){ 

        var room = {name: connection.escape(sessionname).toLowerCase(), id: result.insertId};

        console.log('Added to room:' + connection.escape(sessionname).toLowerCase());
        socket.join(connection.escape(sessionname).toLowerCase());
        
        map.set(socket.id, room);

        socket.emit('create_succeeded');

        }else{
            console.log('there was a mysql error!');
        }

        });


    }else{
        
        socket.emit('create_failed');

    }

    });

});

socket.on('join_session',function(data){

    console.log(data);

    var sessionname = data.sessionname;

    connection.query('SELECT * FROM session WHERE name = ' + connection.escape(sessionname), function(err, rows, fields) {
    
    if(rows.length == 0){

        socket.emit('join_failed');


    }else{
        
        if(rows[0].protected == 1){

            socket.emit('password');

        }
        else
        {

        var room = {name: connection.escape(sessionname).toLowerCase(), id: rows[0].id};
        console.log('Added to room:' + connection.escape(sessionname).toLowerCase());
        socket.join(connection.escape(sessionname).toLowerCase());
        map.set(socket.id, room);
        socket.emit('join_succeeded');
        
    }

    }

    });

});

socket.on('sync_request',function(data){

    var room = map.get(socket.id);

    console.log('sync request');

    connection.query('SELECT * FROM tracks WHERE session_id = ' + room.id + ' AND status = 0 ORDER BY added', function(err, rows, fields) {
    
        console.log('sync result' + rows);
        socket.emit('sync_queue', {'rows': rows});
    
    });

    connection.query('SELECT * FROM tracks WHERE session_id = ' + room.id + ' AND status = 2 ORDER BY added', function(err, rows, fields) {
    
        console.log('sync result' + rows);
        socket.emit('sync_history', {'rows': rows});
    
    });


});

socket.on('update_id',function(data){

    var room = map.get(data.oldid);

    console.log('OLD ' + data.oldid);

    map.set(socket.id, room);
    socket.join(room.name);

    console.log('updating room...' + room.name + room.id);

});


});

setInterval(function(){

connection.query('DELETE FROM session WHERE created < (NOW() - INTERVAL 30 MINUTE)');
console.log('Deleting old sessions...');

}, 6000000);

server.listen(80);

console.log('Application Started on http://localhost:80/');