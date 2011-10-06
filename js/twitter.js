/*
http://www.simonwhatley.co.uk/parsing-twitter-usernames-hashtags-and-urls-with-javascript

http://dev.twitter.com/pages/using_search
*/
var tw = (function () {

    var twitter = {


        parseURL : function (data) {
            return data.replace(/[A-Za-z]+:\/\/[A-Za-z0-9-_]+\.[A-Za-z0-9-_:%&~\?\/.=]+/g, function(url) {
                return url.link(url);
            });
        },

        parseUsername : function(data) {
            return data.replace(/[@]+[A-Za-z0-9-_]+/g, function(u) {
                var username = u.replace("@","")
                return u.link("http://twitter.com/"+username);
            });
        },

        parseHashtag : function(data) {
            return data.replace(/[#]+[A-Za-z0-9-_]+/g, function(t) {
                var tag = t.replace("#","%23")
                return t.link("http://search.twitter.com/search?q="+tag);
            });
        },

        load : function(arg,callback){
            var script = document.createElement('script'),
                head = document.getElementsByTagName('head')[0];
            this.toCall = callback;

            script.id = "tmp";
            script.src = arg.url + "&callback="+"tw.toCall";
            head.appendChild(script);
        },

        search : function(search, callback) {
            this.load({url:'http://search.twitter.com/search.json?q=' + escape(search)},function(d){
                        var twitts = d.results, i, atwitts = [], that = this;
                        for(i = 0; i< twitts.length; i+=1){
                            var text = twitts[i].text;

                            atwitts.push({
                                img : '<img src="' + twitts[i].profile_image_url + '" width="48px" height="48px"/>',
                                msg : that.parseHashtag(that.parseUsername(that.parseURL(text))),
                                user : twitts[i].from_user
                            });
                        }

                        callback(atwitts);

                    });
        }



    }

    return twitter;

}());
