
var request = require('request'),
    models = require('../../models');


// create router definition

function ApiRouter (express) {
    
    // save expree reference
    this.express = express;
    
    // routes: get
    this.express.get('/api/picture', this.picture);
    this.express.get('/api/statistics', this.statistics);
    
    // routes: post
    this.express.post('/api/statistics', this.statistics_post);
    
};


ApiRouter.prototype.picture = function (req, res) {
    
    try {
        
        var access_token = req.query.access_token,
            friend_id = req.query.friend_id,
            photo_url = 'https://graph.facebook.com/' + friend_id + '/picture?type=large&access_token=' + access_token;
        
        return request.get(photo_url).pipe(res);
        
    } catch (err) {
        
        return res.send(err, 404);
        
    }
    
};


ApiRouter.prototype.statistics = function (req, res) {
    
    models.user.find({}, function (err, users) {
        
        return res.send(users);
        
    });
    
};


ApiRouter.prototype.statistics_post = function (req, res) {
    
    var stats_payload = req.body.stats_payload,
        stats_user = stats_payload.facebook_id;
    
    models.user.update(stats_user, stats_payload, function (err, result) {
        
        return res.send({ success: result });
        
    });
    
};


// export router definition

module.exports = ApiRouter;
