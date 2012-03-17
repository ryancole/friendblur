
var mongodb = require('mongodb');


// instantiate database connection

var database_server = new mongodb.Server('localhost', mongodb.Connection.DEFAULT_PORT),
    database_connection = new mongodb.Db('friendblur', database_server);


database_connection.open(function (err, db) {
    
    console.log('database state: ' + db.state);
    
});


// export model instances

module.exports = {
    
    user: new (require('./user'))(database_connection)
    
};