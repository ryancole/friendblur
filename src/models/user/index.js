

var UserModel = module.exports = function (database) {
    
    this.db = database;
    
};


UserModel.prototype.find = function (document_spec, callback) {
    
    this.db.collection('users', function (err, users) {
        
        // get the cursor
        var cursor = users.find(document_spec);
        
        // specify result format
        cursor.sort({ successful_rounds: -1 }).limit(10).toArray(function (err, users) {
            
            return callback(err, users);
            
        });
        
    });
    
};


UserModel.prototype.update = function (id, document_spec, callback) {
    
    this.db.collection('users', function (err, users) {
        
        users.update({ facebook_id: id }, { $set: { facebook_name: document_spec.facebook_name }, $inc: { successful_rounds: 1 } }, { safe: true, multi: true, upsert: true }, function (err, result) {
            
            return callback(null, true);
            
        });
        
    });
    
};