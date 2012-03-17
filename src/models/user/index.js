

var UserModel = module.exports = function (database) {
    
    this.db = database;
    
};


UserModel.prototype.update = function (id, document_spec, callback) {
    
    this.db.collection('users', function (err, users) {
        
        users.update({ facebook_id: id }, { $set: { facebook_name: document_spec.name }, $inc: { successful_rounds: 1 } }, { safe: true, multi: true, upsert: true }, function (err, result) {
            
            return callback(null, true);
            
        });
        
    });
    
};