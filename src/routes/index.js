
// export router instances

module.exports = function(app) {
    
    return {
        
        api: new (require('./api'))(app),
        game: new (require('./game'))(app)
        
    };
    
};
