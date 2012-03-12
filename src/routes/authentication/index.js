

var AuthenticationRouter = module.exports = function (express) {
    
    // save reference to express
    this.express = express;
    
    // routes: get
    this.express.get('/', this.foo);
    this.express.get('/auth/signin', this.signin);
    
};


AuthenticationRouter.prototype.signin = function (req, res) {

    req.authenticate([req.param('method')], function (err, authenticated) {

        if (authenticated) {

            return res.end('lol');

        } else {

            return res.end('haha');

        }

    });
    
};


AuthenticationRouter.prototype.foo = function (req, res) {

    if (req.isAuthenticated()) {

        return res.send('u r signed in, woot');

    } else {

        return res.redirect('/auth/signin?method=facebook&redirectUrl=' + escape(req.url));

    }

};