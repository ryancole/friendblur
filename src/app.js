
var swig = require('swig'),
    express = require('express');


// initialize application server

var app = module.exports = express.createServer();


// configure template engine

app.set('view engine', 'html');
app.set('views', __dirname + '/views');
app.set('view options', { layout: false });
app.register('.html', swig);

swig.init({ root: __dirname + '/views' });


// configure application server

app.configure(function() {
    
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    
    app.use(express.errorHandler({
        dumpExceptions : true,
        showStack : true
    }));
    
    app.use(app.router);
    
});


// instantiate route handlers

var routes = (require('./routes'))(app);


// listen for incoming requests

app.listen('/tmp/friendblur.sock');