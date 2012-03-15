
var request = require('request');


// define route handler

function GameRouter (express) {
    
    // save expree reference
    this.express = express;
    
    // routes: get
    this.express.get('/', this.about);
    this.express.get('/play/', this.play);
    this.express.get('/friend', this.friend);
    
};


GameRouter.prototype.about = function (req, res) {
    
    return res.render('game/about')
    
};


GameRouter.prototype.play = function (req, res) {
    
    return res.render('game/play');
    
};


GameRouter.prototype.friend = function (req, res) {
    
    var access_token = req.query.access_token,
        friend_id = req.query.friend_id,
        photo_url = 'https://graph.facebook.com/' + friend_id + '/picture?type=large&access_token=' + access_token;
    
    try {
        return request.get(photo_url).pipe(res);
    } catch (err) {
        console.log('caught err: ' + err);
        return res.send(err, 404);
    }
    
};



// export router instances

module.exports = function(app) {
    
    return {
        game: new GameRouter(app)
    };
    
};