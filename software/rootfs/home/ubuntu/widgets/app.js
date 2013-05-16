var express  = require('express'),
    http     = require('http'),
    robot    = require('ansync-robot'),
    ansync   = require('libvita'),
    socketio = require('socket.io'),
    spawn    = require('child_process').spawn,
    fs       = require('fs'),
    app      = module.exports = express();

var robots = [];

process.stdin.on('keypress', function(char, key) {
    if (key && key.ctrl && key.name == 'c') {
        console.log('Exiting . . . ');

        closeDevices();

        process.exit();
    }
});


// Configuration
app.configure(function() {
    var oneYear = 31557600000;

    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { pretty: true , layout: false});
    app.engine('.html', require('jade').render);
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/public', { maxAge: oneYear }));
});

app.configure('development', function() {
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function() {
    app.use(express.errorHandler());
});

// Routes and HTTP request handling
app.get('/', function(req, res, outPort) {
    res.render('index', { title: 'Ansync Widget Sandbox', serverUrl: req.headers.host.toString()});
});

var server = http.createServer(app).listen(2000, function() {
    console.log('Ansync Widget Sandbox listening on port %d in %s mode', server.address().port, app.settings.env);
});

server.on('error', function(err) {
    console.log('Server error: ' + err);
    closeDevices();
    process.exit();
});

// Initialize SocketIO and Ansync
var io = socketio.listen(server, {'log level': 1});

//////////////////////////
//'link' the robot module to the common express instance
robots = robot.link(app, express);

for (robot_name in robots) {
    if (robots.hasOwnProperty(robot_name)) {
        var bot = robots[robot_name];
        var j = 0;

        for (i = 0; i < bot.boards.length; i++) {
            var boardString = "usb:" + bot.boards[i].class + "/";

            if (bot.boards[i].serial) {
                boardString += bot.boards[i].serial;
            }

            ansync.open(boardString, function(err, board) {
                if (err) {
                    console.log(err);
                } else {
                    bot.devices[i] = board;

                    if (bot.boards[i].type === "motor") {
                        bot.motors[j] = board;
                        j++;
                    } else if (bot.boards[i].type === "sensor") {
                        bot.sensors[bot.boards[i].name] = board;
                    }
                }
            });

        }

        robot.initSensors(bot);
    }
}
/////////////////////////

io.sockets.on('connection', function(socket) {
    setInterval(function() {
        var signal;

        fs.readFile("/proc/net/wireless", function(err, data) {
            if (!err) {
                var lines = data.toString().split('\n');
                var mark = lines[2].indexOf('.');
                var wifi = parseInt(lines[2].substring(mark - 3, mark), 10);

                socket.emit('wifi', {signal: wifi});
            }
        });
    }, 1000);

    socket.on('sound', function() {
        var index = Math.floor(Math.random() * (3 - 1 + 1)) + 1;

        if (index == 1) {
            spawn('aplay', ['/home/ubuntu/audio/sit.wav']);
        } else if (index == 2) {
            spawn('aplay', ['/home/ubuntu/audio/stay.wav']);
        } else {
            spawn('aplay', ['/home/ubuntu/audio/down.wav']);
        }
    });
});

function closeDevices() {
    for (robot_name in robots) {
        if (robots.hasOwnProperty(robot_name)) {
            var robot = robots[robot_name];
            for (var i = 0; i < robot.boards.length; i++) {
                robot.devices[i].close();
            }
            robot.close();
        }
    }
}
