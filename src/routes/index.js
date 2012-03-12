

// export router instances

module.exports = function(app) {
    
    return {
        authentication: new (require('./authentication'))(app)
    };
    
};