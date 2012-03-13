

// friendblur global namespace

var Friendblur = {
    
    // facebook stuff
    Facebook: {},
    
    // backbone stuff
    Views: {},
    Models: {},
    Collections: {}
    
};


// authenticated user model

Friendblur.Models.User = Backbone.Model.extend({
    
    // constructor
    initialize: function (data) {
        
        // initialize friends collection and view
        Friendblur.friends = new Friendblur.Collections.Friends();
        Friendblur.random_friend = new Friendblur.Views.RandomFriend();
        
        // query friends from facebook api
        Friendblur.friends.from_facebook('https://graph.facebook.com/me/friends?' + Friendblur.Facebook.access_token);
        
    }
    
});


Friendblur.Models.Friend = Backbone.Model.extend({
    
    initialize: function (friend) {
        
        this.set('profile_photo_url', 'https://graph.facebook.com/' + friend.id + '/picture?type=large&' + Friendblur.Facebook.access_token);
        
    }
    
});


// facebook friends collection

Friendblur.Collections.Friends = Backbone.Collection.extend({
    
    // collection model
    model: Friendblur.Models.Friend,
    
    // utility method for loading friends from facebook api
    from_facebook: function (url) {
        
        $.getJSON(url, function (result) {
            
            // add these friends to the collection
            Friendblur.friends.add(result.data);
            
            // if there are more pages, query for them, too
            if ('next' in result.paging)
                Friendblur.friends.from_facebook(result.paging.next);
                
            else
                Friendblur.random_friend.randomize();
            
        });
        
    }
    
});


// random friend view

Friendblur.Views.RandomFriend = Backbone.View.extend({
    
    // element to render friend in
    el: '#random-friend',
    
    // method to select random friend and set picture
    render: function () {
        
        $(this.el).css('background-image', 'url(' + this.random_friend.get('profile_photo_url') + ')');
        $('#blur-frame').blurjs({ radius: 10, source: this.el });
        
    },
    
    
    randomize: function () {
        
        // get random number
        var random_number = Math.floor(Math.random() * Friendblur.friends.length);
        
        // set random friend
        this.random_friend = Friendblur.friends.at(random_number);
        
        // render this friend
        this.render();
        
    }
    
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