

// define route handler

function GameRouter (express) {
    
    // save expree reference
    this.express = express;
    
    // routes: get
    this.express.get('/play', this.play);
    
};


GameRouter.prototype.play = function (req, res) {
    
    res.render('game/play');
    
};




// export router instances

module.exports = function(app) {
    
    return {
        game: new GameRouter(app)
    };
    
};