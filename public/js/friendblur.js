

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
        Friendblur.random_friends = new Friendblur.Views.RandomFriends();
        
        // query friends from facebook api
        Friendblur.friends.from_facebook('https://graph.facebook.com/me/friends?' + Friendblur.Facebook.access_token);
        
    }
    
});


Friendblur.Models.Friend = Backbone.Model.extend({
    
    initialize: function (friend) {
        
        this.set('profile_photo_url', 'http://friendblur.com/friend?friend_id=' + friend.id + '&' + Friendblur.Facebook.access_token);
        
    }
    
});


// facebook friends collection

Friendblur.Collections.Friends = Backbone.Collection.extend({
    
    // collection model
    model: Friendblur.Models.Friend,
    
    set_typeahead: function () {
        
        // bootstrap only allows 1 match :(
        $('#guess-input1').typeahead({
            
            source: this.pluck('name')
            
        }).change(function (event) {
            
            // get this friend
            var this_friend = Friendblur.random_friends.random_friends[0];
            
            // compare names
            if (this_friend.get('name') === this.value) {
                
                $('#search-container1').addClass('success');
                $('#search-container1 .icon-search').addClass('icon-ok').removeClass('icon-search');
                
                // track this even with mixpanel
                mpq.track("successful guess");
                
            } else {
                
                $('#search-container1').addClass('error');
                
                // track this even with mixpanel
                mpq.track("failed guess");
                
            }
            
            // disable this, only 1 guess allowed
            $(this).attr('disabled', true);
            
        });
        
        // bootstrap only allows 1 match :(
        $('#guess-input2').typeahead({
            
            source: this.pluck('name')
            
        }).change(function (event) {
            
            // get this friend
            var this_friend = Friendblur.random_friends.random_friends[1];
            
            // compare names
            if (this_friend.get('name') === this.value) {
                
                // success
                $('#search-container2').addClass('success');
                $('#search-container2 .icon-search').addClass('icon-ok').removeClass('icon-search');
                
                // track this even with mixpanel
                mpq.track("successful guess");
                
            } else {
                
                $('#search-container2').addClass('error');
                
                // track this even with mixpanel
                mpq.track("failed guess");
                
            }
            
            // disable this, only 1 guess allowed
            $(this).attr('disabled', true);
            
        });
        
        // bootstrap only allows 1 match :(
        $('#guess-input3').typeahead({
            
            source: this.pluck('name')
            
        }).change(function (event) {
            
            // get this friend
            var this_friend = Friendblur.random_friends.random_friends[2];
            
            // compare names
            if (this_friend.get('name') === this.value) {
                
                // success
                $('#search-container3').addClass('success');
                $('#search-container3 .icon-search').addClass('icon-ok').removeClass('icon-search');
                
                // track this even with mixpanel
                mpq.track("successful guess");
                
            } else {
                
                $('#search-container3').addClass('error');
                
                // track this even with mixpanel
                mpq.track("failed guess");
                
            }
            
            // disable this, only 1 guess allowed
            $(this).attr('disabled', true);
            
        });
        
    },
    
    // utility method for loading friends from facebook api
    from_facebook: function (url) {
        
        $.getJSON(url, function (result) {
            
            // add these friends to the collection
            Friendblur.friends.add(result.data);
            
            if ('next' in result.paging) {
                
                // if there are more pages, query for them, too
                Friendblur.friends.from_facebook(result.paging.next);
            
            } else {
                
                // enable typeahead
                Friendblur.friends.set_typeahead();
                
                // show a random friend
                Friendblur.random_friends.randomize();
                
            }
            
        });
        
    }
    
});


// random friend view

Friendblur.Views.RandomFriends = Backbone.View.extend({
    
    // source elements
    els: ['#random-friend1', '#random-friend2', '#random-friend3'],
    
    // the blur radius
    radius: 10,
    
    // method to select random friend and set picture
    render: function () {
        
        // set source images
        $(this.els[0]).css('background-image', 'url(' + this.random_friends[0].get('profile_photo_url') + ')');
        $(this.els[1]).css('background-image', 'url(' + this.random_friends[1].get('profile_photo_url') + ')');
        $(this.els[2]).css('background-image', 'url(' + this.random_friends[2].get('profile_photo_url') + ')');
        
        // blur the source images
        $('img[id^=blur-friend]').blurjs({ radius: this.radius, source: this.els });
        
        // instantiate timer id and start a new game round
        Friendblur.timer_id = 0;
        Friendblur.round = new Friendblur.Views.RoundView();
        Friendblur.round.timer_tick();
        
    },
    
    // render same friends with lower blur
    render_again: function () {
        
        // reduce the radius
        this.radius = this.radius - 2;
        
        // blur the source images
        $('img[id^=blur-friend]').blurjs({ radius: this.radius, source: this.els });
        
    },
    
    
    randomize: function () {
        
        var random_numbers = [Math.floor(Math.random() * Friendblur.friends.length),
                              Math.floor(Math.random() * Friendblur.friends.length),
                              Math.floor(Math.random() * Friendblur.friends.length)];
        
        // randomize friends
        this.random_friends = [Friendblur.friends.at(random_numbers[0]),
                               Friendblur.friends.at(random_numbers[1]),
                               Friendblur.friends.at(random_numbers[2])];
        
        // reset the blur radius
        this.radius = 10;
        
        // render the friends
        this.render();
        
        // track this even with mixpanel
        mpq.track("new round");
        
    }
    
});


// the game view

Friendblur.Views.RoundView = Backbone.View.extend({
    
    // timer element
    el: '#round-timer',
    
    // iteration count
    countdown: 3,
    
    // constructor
    initialize: function () {
        
        // clear previous timer, if still going
        if (Friendblur.timer_id != 0)
            clearInterval(Friendblur.timer_id);
        
        // reset timer iterations
        this.countdown = 3;
        
        // enable the input boxes
        $('input[id^=guess-input]').attr('disabled', false).val('');
        $('div[id^=search-container]').removeClass('success').removeClass('error');
        $('i[class^=icon-]').addClass('icon-search').removeClass('icon-error').removeClass('icon-ok');
        
    },
    
    
    // manage the game timer
    timer_tick: function () {
        
        if (Friendblur.timer_id == 0) {
            
            Friendblur.timer_id = setInterval(Friendblur.round.timer_tick.bind(this), 4000);
            
        } else {
            
            if (this.countdown > 0) {
            
                // reduce the blur
                Friendblur.random_friends.render_again();
            
                // show count-down
                this.countdown = this.countdown - 1;
                this.$el.html('time left: ' + ((this.countdown + 1) * 4) + ' seconds');
            
            } else {
                
                this.$el.html('round over! starting new round.');
                
                // clear the timer interval
                clearInterval(Friendblur.timer_id);
                
                // start all over again
                Friendblur.random_friends.randomize();
                
            }
            
        }
        
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