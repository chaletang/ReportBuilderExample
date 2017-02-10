JQTWEET = {

    // Set twitter username, number of tweets & id/class to append tweets
    //	user: 'theHCCA',
    //	numTweets: 5,
    //	appendTo: '#jstwitter',

    // core function of jqtweet
    loadTweetsData: function () {
        // Test twitter in local
        // Added bySenthil
        //var html = '<div class="tweet">TWEET_TEXT<div class="time">AGO</div>';
        //var data = [{ "ImageUrl": "", "ScreenName": "Senthil", "CreatedDate": "12/6/2013 11:37:43 AM", "Tweet": "CMS Releases Latest Value-Based Purchasing Program Scorecard", "ID": 1 }, { "ImageUrl": "", "ScreenName": "Senthil", "CreatedDate": "12/6/2013 11:37:43 AM", "Tweet": "Virtual Research Data Center Offers Secure Timely Access to Data at Lower Cost", "ID": 1 }, { "ImageUrl": "", "ScreenName": "Senthil", "CreatedDate": "12/6/2013 11:37:43 AM", "Tweet": "Fighting Medicaid Fraud, Waste, and Abuse Through Education", "ID": 1 }, { "ImageUrl": "", "ScreenName": "Senthil", "CreatedDate": "12/6/2013 11:37:43 AM", "Tweet": "Premium and Prescription Savings are Good News for People with Medicare", "ID": 1 }, { "ImageUrl": "", "ScreenName": "Senthil", "CreatedDate": "12/6/2013 11:37:43 AM", "Tweet": "Moving Forward on Arkansasâ€™ Innovative Plan to Provide Health Coverage to 200,000 Arkansans", "ID": 1 }, { "ImageUrl": "", "ScreenName": "Senthil", "CreatedDate": "12/6/2013 11:37:43 AM", "Tweet": "Encouraging news about enrollment in Medicaid and CHIP", "ID": 1 }, { "ImageUrl": "", "ScreenName": "Senthil", "CreatedDate": "12/6/2013 11:37:43 AM", "Tweet": "A guide for new and first-time physicians participating in federal healthcare programs", "ID": 1 }, { "ImageUrl": "", "ScreenName": "Senthil", "CreatedDate": "12/6/2013 11:37:43 AM", "Tweet": "CMS Moves Toward Greater Transparency", "ID": 1 }, { "ImageUrl": "", "ScreenName": "Senthil", "CreatedDate": "12/6/2013 11:37:43 AM", "Tweet": "Medicaid at Forty-eight", "ID": 1 }, { "ImageUrl": "", "ScreenName": "Senthil", "CreatedDate": "12/6/2013 11:37:43 AM", "Tweet": "CMS Releases App To Streamline Open Payment Program", "ID": 1 }]
        //try {
        //    // append tweets into page
        //    for (var i = 0; i < data.length; i++) {
        //        $(JQTWEET.appendTo).append(
        //        html.replace('TWEET_TEXT', JQTWEET.ify.clean(data[i].Tweet))
        //            .replace(/USER/g, data[i].ScreenName)
        //            .replace('AGO', JQTWEET.timeAgo(data[i].CreatedDate))
        //            .replace(/ID/g, data[i].ID)
        //    );               
        //    }
        //    if ($(JQTWEET.appendTo).attr('id') === 'jstwitter') {
        //        $("#fTwitterPwC").jScrollPane({ showArrows: true, autoReinitialise: true });
        //    }
        //    else {
        //        $("#fTwitterClient").jScrollPane({ showArrows: true, autoReinitialise: true });
        //    }
        //}

        //catch (e) {
        //    console.log(e);
        //}

        //return;
        // Test ends 

        var twitter;
        // different JSON request {hash|user}
        if (JQTWEET.search) {
            twitter = {
                NumberOfTweets: JQTWEET.numTweets,
                api: 'search_tweets',
                TwitterUserID: JQTWEET.search
            }
        } else {
            twitter = {
                TwitterUserID: JQTWEET.user,
                NumberOfTweets: JQTWEET.numTweets,
                api: 'statuses_userTimeline'
            }
        }
        $.ajax({
            url: getBaseUrl() + 'portal/GetTwitterFeed',
            type: 'POST',
            dataType: 'json',
            async: false,
            data: twitter,
            success: function (data, textStatus, xhr) {
                var html = '<div class="tweet">TWEET_TEXT<div class="time">AGO</div>';
                try {
                    $(JQTWEET.appendTo).html('');
                    // append tweets into page
                    for (var i = 0; i < data.length; i++) {
                        $(JQTWEET.appendTo).append(
                        html.replace('TWEET_TEXT', JQTWEET.ify.clean(data[i].Tweet))
                            .replace(/USER/g, data[i].ScreenName)
                            .replace('AGO', JQTWEET.timeAgo(data[i].CreatedDate))
                            .replace(/ID/g, data[i].ID)
                    );

                    }
                    if ($(JQTWEET.appendTo).attr('id') === 'jstwitter') {
                        $("#fTwitterPwC").jScrollPane({ showArrows: true, autoReinitialise: true });
                    }
                    else {
                        $("#fTwitterClient").jScrollPane({ showArrows: true, autoReinitialise: true });
                    }
                }

                catch (e) {
                    console.log(e);
                }
            }
        });

    },
    /**
    * relative time calculator FROM TWITTER
    * @param {string} twitter date string returned from Twitter API
    * @return {string} relative time like "2 minutes ago"
    */
    timeAgo: function (dateString) {
        var rightNow = new Date();
        var then = new Date(dateString);

        if ($.browser.msie) {
            // IE can't parse these crazy Ruby dates
            then = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));
        }

        var diff = rightNow - then;

        var second = 1000,
        minute = second * 60,
        hour = minute * 60,
        day = hour * 24,
        week = day * 7;

        if (isNaN(diff) || diff < 0) {
            return ""; // return blank string if unknown
        }

        if (diff < second * 2) {
            // within 2 seconds
            return "right now";
        }

        if (diff < minute) {
            return Math.floor(diff / second) + " seconds ago";
        }

        if (diff < minute * 2) {
            return "about 1 minute ago";
        }

        if (diff < hour) {
            return Math.floor(diff / minute) + " minutes ago";
        }

        if (diff < hour * 2) {
            return "about 1 hour ago";
        }

        if (diff < day) {
            return Math.floor(diff / hour) + " hours ago";
        }

        if (diff > day && diff < day * 2) {
            return "yesterday";
        }

        if (diff < day * 365) {
            return Math.floor(diff / day) + " days ago";
        }

        else {
            return "over a year ago";
        }
    }, // timeAgo()


    /**
    * The Twitalinkahashifyer!
    * http://www.dustindiaz.com/basement/ify.html
    * Eg:
    * ify.clean('your tweet text');
    */
    ify: {
        link: function (tweet) {
            return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function (link, m1, m2, m3, m4) {
                var http = m2.match(/w/) ? 'http://' : '';
                return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + '...' : m1) + '</a>' + m4;
            });
        },

        at: function (tweet) {
            return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20})/g, function (m, username) {
                return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
            });
        },

        list: function (tweet) {
            return tweet.replace(/\B[@＠]([a-zA-Z0-9_]{1,20}\/\w+)/g, function (m, userlist) {
                return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
            });
        },

        hash: function (tweet) {
            return tweet.replace(/(^|\s+)#(\w+)/gi, function (m, before, hash) {
                return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
            });
        },

        clean: function (tweet) {
            return this.hash(this.at(this.list(this.link(tweet))));
        }
    } // ify


};



$(document).ready(function () {
    // start jqtweet!
    //JQTWEET.loadTweets();
});
