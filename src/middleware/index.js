

// route-specific middleware

exports.restricted = function (req, res, next) {
    
    // continue if authenticated
    if (req.isAuthenticated())
        return next()
    
    // redirect to facebook login
    return res.redirect('/auth/signin?method=facebook&redirectUrl=' + escape('http://friendblur.com/'));
};