var express  = require('express'),
    http     = require('http'),
    tty      = require('tty'),
    optimist = require('optimist'),
    os       = require('os'),
    robot    = require('ansync-robot'),
    ansync   = require('ansync'),
    socketio = require('socket.io'),
    app      = module.exports = express(),
    argv     = optimist
                   .usage('Usage: an2006 [options]')
                   .alias('p', 'port')
                   .alias('h', '?')
                   .alias('h', 'help')
                   .alias('q', 'quiet')
                   .alias('v', 'verbosity')
                   .describe('p', 'Port to listen on.')
                   .describe('q', 'Quiet.  Turns off logging.  Equivalent to -v 0.  Overrides -v.')
                   .describe('v', 'Verbosity level. 0 = no logging, 3 = maximum logging.')
                   .describe('h', 'Show this usage.')
                   .default('p', 2000)
                   .default('v', 0)
                   .boolean('q')
                   .check(function(argv) {
                       if (typeof argv.p !== 'number' || parseFloat(argv.p) != parseInt(argv.p) || isNaN(argv.p) || argv.p < 80 || argv.p > 65534) {
                           throw new Error('Invalid port: ' + argv.p + '.  Valid ports are 80 - 65534.');
                       }
                   })
                   .argv;

var config = {};
var devices = {};
var loglevel = 1;

// Preflight init
// Handle args
if (argv.h) {
    console.log(optimist.help());
    process.exit();
}

if (argv.q) {
    loglevel = 0;
} else if (typeof argv.v === 'number' && parseFloat(argv.v) == parseInt(argv.v) && !isNaN(argv.v) && argv.v >= 0 && argv.v <= 3) {
    loglevel = argv.v;
}

if (os.platform() == "win32") {
    // Setup control-c handler for Windows
    process.stdin.resume();
    tty.setRawMode(true);
}

process.stdin.on('keypress', function(char, key) {
    if (key && key.ctrl && key.name == 'c') {
        console.log('Exiting . . . ');
        ansync.quit(); // Unbind devices
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

var server = http.createServer(app).listen(argv.port, function() {
    console.log('Ansync Widget Sandbox listening on port %d in %s mode', server.address().port, app.settings.env);
});

server.on('error', function(err) {
    console.log('Server error: ' + err);
    ansync.quit();
    process.exit();
});

// Initialize SocketIO and Ansync
var io = socketio.listen(server, {'log level': loglevel});
ansync.init(app, io, {'log level': loglevel});

//////////////////////////
//'link' the robot module to the common express instance
var i, robots = robot.link(app, express);
for (robot_name in robots) {
    if (robots.hasOwnProperty(robot_name)) {
        var foo = robots[robot_name];
        for (i = 0; i < foo.boards.length; i +=1) {
            foo.devices[i] = ansync.getDevice(foo.boards[i].serial, null, "AN2053");
            if (foo.devices[i] instanceof Error) {
                console.log(foo.devices[i].toString());
            }
        }
    }
}
/////////////////////////

io.sockets.on('connection', function(socket) {
    ansync.bindSocket(socket);
});