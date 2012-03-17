
var request = require('request'),
    models = require('../models');


// define route handler

function GameRouter (express) {
    
    // save expree reference
    this.express = express;
    
    // routes: get
    this.express.get('/', this.about);
    this.express.get('/play/', this.play);
    this.express.get('/friend', this.friend);
    
    // routes: post
    this.express.post('/stats', this.stats_post);
    
};


GameRouter.prototype.about = function (req, res) {
    
    return res.render('game/about')
    
};


GameRouter.prototype.play = function (req, res) {
    
    return res.render('game/play');
    
};


GameRouter.prototype.friend = function (req, res) {
    
    try {
        
        var access_token = req.query.access_token,
            friend_id = req.query.friend_id,
            photo_url = 'https://graph.facebook.com/' + friend_id + '/picture?type=large&access_token=' + access_token;
        
        return request.get(photo_url).pipe(res);
        
    } catch (err) {
        
        return res.send(err, 404);
        
    }
    
};


GameRouter.prototype.stats_post = function (req, res) {
    
    var stats_payload = req.body.stats_payload,
        stats_user = stats_payload.facebook_id;
    
    models.user.update(stats_user, stats_payload, function (err, result) {
        
        return res.send({ success: result });
        
    });
    
};



// export router instances

module.exports = function(app) {
    
    return {
        game: new GameRouter(app)
    };
    
};