

// friendblur global namespace

var Friendblur = {
    
    // facebook stuff
    Facebook: {},
    
    // backbone stuff
    Views: {},
    Models: {},
    Collections: {}
    
};


Friendblur.Models.User = Backbone.Model.extend({
    
    // constructor
    initialize: function (data) {
        
        $.getJSON('https://graph.facebook.com/me/friends?' + Friendblur.Facebook.access_token, function (result) {
            
            Friendblur.friends = new Friendblur.Collections.Friends(result.data);
            
        });
        
    }
    
});


Friendblur.Models.Friend = Backbone.Model.extend({
    
});


Friendblur.Collections.Friends = Backbone.Collection.extend({
    
    // collection model
    model: Friendblur.Models.Friend
    
});


function InitializeFriendblur (access_token) {
    
    $.getJSON('https://graph.facebook.com/me?' + access_token, function (result) {
        
        // create the authenticated user
        Friendblur.user = new Friendblur.Models.User(result);
        
    });
    
}



$(function () {
    
    // friendblur app id
    Friendblur.Facebook.app_id = "275172692558681";
    
    // redirect to oauth login if we need token
    if (window.location.hash.length == 0) {
        
        // format authentication url
        var path = 'https://www.facebook.com/dialog/oauth?',
            queryParams = ['client_id=' + Friendblur.Facebook.app_id, 'redirect_uri=' + window.location, 'response_type=token'],
            query = queryParams.join('&');
        
        // open the authentication dialog
        window.location = path + query;
        
    }
    
    // get access token from url
    Friendblur.Facebook.access_token = window.location.hash.substring(1);
    
    // we have token, initialize backbone models
    InitializeFriendblur(Friendblur.Facebook.access_token);
    
});