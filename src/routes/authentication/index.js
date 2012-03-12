
var middleware = require('../../middleware');


var AuthenticationRouter = module.exports = function (express) {
    
    // save reference to express
    this.express = express;
    
    // routes: get
    this.express.get('/', middleware.restricted, this.foo);
    this.express.get('/auth/signin', this.signin);
    
};


AuthenticationRouter.prototype.signin = function (req, res) {

    // begin oauth authentication
    req.authenticate(['facebook'], function (err, authenticated) {

        if (authenticated) {

            return res.redirect('/');

        } else {

            return res.end('authentication failed');

        }

    });
    
};


AuthenticationRouter.prototype.foo = function (req, res) {

    return res.send(req.getAuthDetails());

};