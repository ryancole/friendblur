

// friendblur global namespace

var Friendblur = {
    
    // facebook stuff
    Facebook: {},
    
    // backbone stuff
    Views: {},
    Models: {},
    Collections: {}
    
};


// MODELS

Friendblur.Models.User = Backbone.Model.extend({
    
    // constructor
    initialize: function (data) {
        
        // we only want to query friends once, so it's a global variable
        Friendblur.friends = new Friendblur.Collections.Friends();
        
        // query friends from facebook api
        Friendblur.friends.from_facebook('https://graph.facebook.com/me/friends?' + Friendblur.Facebook.access_token);
        
    }
    
});


Friendblur.Models.Friend = Backbone.Model.extend({
    
    initialize: function (friend) {
        
        var photo_url = window.location.protocol + '//' + window.location.hostname + '/friend?friend_id=' + friend.id + '&' + Friendblur.Facebook.access_token;
        
        this.set('profile_photo_url', photo_url);
        
    }
    
});


// COLLECTIONS

Friendblur.Collections.Friends = Backbone.Collection.extend({
    
    // collection model
    model: Friendblur.Models.Friend,
    
    // utility method for loading friends from facebook api
    from_facebook: function (url) {
        
        $.getJSON(url + '&callback=?', function (result) {
            
            // add these friends to the collection
            Friendblur.friends.add(result.data);
            
            if ('next' in result.paging) {
                
                // if there are more pages, query for them, too
                Friendblur.friends.from_facebook(result.paging.next);
            
            } else {
                
                // set the plucked friend name list
                Friendblur.friend_names = Friendblur.friends.pluck('name');
                
                // instantiate the first game round
                Friendblur.game_round = new Friendblur.Views.GameRoundView();
                
                // and start it
                Friendblur.game_round.start();
                
            }
            
        });
        
    }
    
});


// VIEWS


Friendblur.Views.InputViews = Backbone.View.extend({
    
    initialize: function () {
        
        this.whatever = this;
        this.els = [new Friendblur.Views.InputView(1),
                    new Friendblur.Views.InputView(2),
                    new Friendblur.Views.InputView(3)];
        
        _.each(this.els, function (input) {
            
            // add new event handlers for this instance
            input.on('guess-attempt', function (event) {
                
                this.trigger('guess-attempt', event);
                
            }.bind(this));
            
        }.bind(this));
        
    },
    
    destroy: function () {
        
        _.each(this.els, function (input) {
            
            input.off('guess-attempt');
            
        });
        
    },
    
    disable: function () {
        
        for (var x = 0; x < this.els.length; x++)
            this.els[x].disable();
        
    },
    
    enable: function () {
        
        for (var x = 0; x < this.els.length; x++)
            this.els[x].enable();
        
    },
    
    reset: function () {
        
        for (var x = 0; x < this.els.length; x++) {
            
            this.els[x].reset();
            this.els[x].enable();
            
        }
        
    }
    
});


Friendblur.Views.InputView = Backbone.View.extend({
    
    initialize: function (index) {
        
        this.el = '#guess-input' + index;
        this.el_icon = this.el + ' .result-icon';
        this.el_container = '#search-container' + index;
        this.index = index;
        
        // enable bootstrap type ahead
        $(this.el).typeahead({
            
            source: Friendblur.friend_names
            
        }).change(function (event) {
            
            // get the selected friend's name
            var this_friend = Friendblur.game_round.friends.random_friends[index - 1].friend.get('name');
            
            // remove style classes
            this.remove_classes();
            
            // compare friend names
            if (this_friend === $(this.el).val()) {
                
                this.success();
                this.trigger('guess-attempt', { success: true, index: this.index });
                
            } else {
                
                this.failure();
                this.trigger('guess-attempt', { success: false, index: this.index });
                
            }
            
            // disable this input
            this.disable();
            
        }.bind(this));
        
    },
    
    reset: function () {
        
        // remove classes
        this.remove_classes();
        
        // reset text inside
        $(this.el).val('');
        
        // add the icon search
        $(this.el_icon).addClass('icon-search');
        
    },
    
    enable: function () {
        
        $(this.el).attr('disabled', false);
        
    },
    
    disable: function () {
        
        $(this.el).attr('disabled', true);
        
    },
    
    remove_classes: function () {
        
        if ($(this.el_container).hasClass('error'))
            $(this.el_container).removeClass('error');
        
        if ($(this.el_icon).hasClass('icon-remove'))
            $(this.el_icon).removeClass('icon-remove');
        
        if ($(this.el_container).hasClass('success'))
            $(this.el_container).removeClass('success');
        
        if ($(this.el_icon).hasClass('icon-ok'))
            $(this.el_icon).removeClass('icon-ok');
            
        if ($(this.el_icon).hasClass('icon-search'))
            $(this.el_icon).removeClass('icon-search');
        
    },
    
    success: function () {
        
        // set success input class
        $(this.el_container).addClass('success');
        
        // set success icon class
        $(this.el_icon).addClass('icon-ok');
        
    },
    
    failure: function () {
        
        // set fail input class
        $(this.el_container).addClass('error');
        
        // set fail icon class
        $(this.el_icon).addClass('icon-remove');
        
    }
    
});



Friendblur.Views.FriendView = Backbone.View.extend({
    
    initialize: function (index) {
        
        this.el = '#image-source' + index;
        this.blur_el = '#image-destination' + index;
        this.name_el = '#friend-name' + index;
        this.index = index;
        
    },
    
    set_friend: function (friend) {
        
        this.friend = friend;
        
    },
    
    render: function (blur) {
        
        // set source image
        $(this.el).css('background-image', 'url(' + this.friend.get('profile_photo_url') + ')');
        
        // render blur image
        $(this.blur_el).blurjs({ radius: blur, source: this.el });
        
    },
    
    show_name: function () {
        
        $(this.name_el).html(this.friend.get('name'));
        
    },
    
    hide_name: function () {
        
        $(this.name_el).html('');
        
    }
    
});


Friendblur.Views.RandomFriendsView = Backbone.View.extend({
    
    initialize: function () {
        
        // instantiate three friend views
        this.random_friends = [new Friendblur.Views.FriendView(1),
                               new Friendblur.Views.FriendView(2),
                               new Friendblur.Views.FriendView(3)];
        
    },
    
    render: function (blur) {
        
        for (var x = 0; x < 3; x++) {

            // render an individual friend object
            this.random_friends[x].render(blur);
            
        }
        
    },
    
    randomize: function () {
        
        var random_numbers = [];
        
        while (random_numbers.length < 3) {
            
            var random_number = Math.floor(Math.random() * Friendblur.friends.length);
            
            // make sure it's not already here
            if ($.inArray(random_number, random_numbers) < 0)
                random_numbers.push(random_number);
            
        }
        
        for (var x = 0; x < 3; x++) {
            
            // set the randomly chosen friends
            this.random_friends[x].set_friend(Friendblur.friends.at(random_numbers[x]));
            
        }
        
    },
    
    show_names: function () {
        
        for (var x = 0; x < this.random_friends.length; x++) {
            
            this.random_friends[x].show_name();
            
        }
        
    },
    
    hide_names: function () {
        
        for (var x = 0; x < this.random_friends.length; x++) {
            
            this.random_friends[x].hide_name();
            
        }
        
    }
    
});


Friendblur.Views.StopRoundView = Backbone.View.extend({
    
    el: '#success-modal',
    
    initialize: function () {

        this.inputs = new Friendblur.Views.InputViews();
        
    },
    
    start: function () {
        
        // show modal
        $(this.el).modal('show');
        
        // set event handler for close
        $(this.el).on('hidden', function () {
            
            this.destroy();
            
        }.bind(this));
        
        // submit stats for previous round
        this.submit_stats({
            
            facebook_id: Friendblur.user.get('id'),
            facebook_name: Friendblur.user.get('name'),
            success: true
            
        });
        
        // track this success
        mixpanel.track('successful round');
        
    },
    
    destroy: function () {
        
        // kill the event handlers
        $(this.el).off('hidden');
        
        // destroy the inputs
        this.inputs.destroy();
        
        // transition back into wait round
        Friendblur.game_round = new Friendblur.Views.WaitRoundView();
        Friendblur.game_round.start();
        
    },
    
    submit_stats: function (payload) {
        
        $.post('/stats', { stats_payload: payload }, function (response) {
            
            console.dir(response);
            
        });
        
    }
    
});


Friendblur.Views.WaitRoundView = Backbone.View.extend({
    
    el: '#round-timer',
    
    initialize: function () {
        
        this.time_remaining = 10;
        this.inputs = new Friendblur.Views.InputViews();
        
    },
    
    start: function () {
        
        // disable the inputs
        this.inputs.disable();
        
        // start the round timer
        this.timer_id = setInterval(this.tick.bind(this), 1000);
    },
    
    tick: function () {
        
        if (this.time_remaining > 0) {
            
            // render round timer
            $(this.el).html('round over! starting new round in ' + this.time_remaining + ' seconds.');
            
            // reduce time remaining
            this.time_remaining = this.time_remaining - 1;
            
        } else {
            
            // clear timer
            clearInterval(this.timer_id);
            
            // destroy this inputs events
            this.inputs.destroy();
            
            // transition into a game round
            Friendblur.game_round = new Friendblur.Views.GameRoundView();
            Friendblur.game_round.start();
            
        }
        
    }
    
});


Friendblur.Views.GameRoundView = Backbone.View.extend({
    
    el: '#round-timer',
    
    initialize: function () {
        
        this.successes = 0,
        this.blur_radius = 10,
        this.time_remaining = 15,
        this.friends = new Friendblur.Views.RandomFriendsView(),
        this.inputs = new Friendblur.Views.InputViews();
        
        // do something with input events here to detect successfull guesses
        this.inputs.on('guess-attempt', function (event) {
            
            if (event.success == true) {
                
                // keep count of successfull guesses
                this.successes = this.successes + 1;
                
                // end this round if they guessed all three
                if (this.successes >= 3)
                    this.time_remaining = 0;
                
                // track this success
                mixpanel.track('successful guess');
                
            } else {
                
                // track this success
                mixpanel.track('failed guess');
                
            }
            
        }.bind(this));
        
    },
    
    destroy: function () {
        
        this.inputs.off('guess-attempt');
        
    },
    
    start: function () {
        
        // clear the old friend's names
        this.friends.hide_names();
        
        // randomize the friends
        this.friends.randomize();
        
        // render the blur pictures
        this.friends.render(this.blur_radius);
        
        // reset input boxes
        this.inputs.reset();
        
        // render round timer
        $(this.el).html('seconds left: ' + this.time_remaining);
        
        // start the round timer
        this.timer_id = setInterval(this.tick.bind(this), 1000);
        
        // track this game round
        mixpanel.track('new round');
        
    },
    
    tick: function () {
        
        if (this.time_remaining > 0) {
            
            // update round timer
            $(this.el).html('seconds left: ' + this.time_remaining);
            
            // decrease blur if needed
            if (this.time_remaining % 4 == 0) {
                
                // reduce blur radius
                this.blur_radius = this.blur_radius - 2;
                
                // render the images again
                this.friends.render(this.blur_radius);
                
            }
            
            // decrease the timer
            this.time_remaining = this.time_remaining - 1;
            
        } else {
            
            // stop the timer
            clearInterval(this.timer_id);
            
            // show the friend's name
            this.friends.show_names();
            
            // render friends with no blur
            this.friends.render(0);
            
            // clean up the inputs events
            this.inputs.destroy();
            
            // destory this
            this.destroy();
            
            // transition into the next game state
            if (this.successes >= 3) {
                
                // a stop round
                Friendblur.game_round = new Friendblur.Views.StopRoundView();
                Friendblur.game_round.start();
                
            } else {
                
                // a wait round
                Friendblur.game_round = new Friendblur.Views.WaitRoundView();
                Friendblur.game_round.start();
                
            }
            
        }
        
    }
    
});


function InitializeFriendblur (access_token) {
    
    $.getJSON('https://graph.facebook.com/me?' + access_token + '&callback=?', function (result) {
        
        // create the authenticated user
        Friendblur.user = new Friendblur.Models.User(result);
        
    });
    
}



$(function () {
    
    // init the modal, first, so it doesn't appear
    $('#success-modal').modal({
        
        show: false
        
    });
    
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