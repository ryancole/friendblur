

// define route handler

function GameRouter (express) {
    
    // save expree reference
    this.express = express;
    
    // routes: get
    this.express.get('/', this.about);
    this.express.get('/play/', this.play);
    
};


GameRouter.prototype.about = function (req, res) {
    
    return res.render('game/about')
    
};


GameRouter.prototype.play = function (req, res) {
    
    return res.render('game/play');
    
};




// export router instances

module.exports = function(app) {
    
    return {
        game: new GameRouter(app)
    };
    
};