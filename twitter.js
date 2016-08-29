var https = require('https'),
    // buffer = require('buffer').Buffer,
    EventEmitter = require('events').EventEmitter,
    crypto = require('crypto'),
    sortByKey = require('./utils').sortByKey,
    randomString = require('./utils').randomString,
    Kvp = require('./utils').Kvp;


var TWITTER_HOST = 'https://stream.twitter.com',
    TWITTER_PATH = '/1.1/statuses/filter.json',
    ACCESS_TOKEN = '438661609-9HjAxUc6OH7pV04gRwRygjdH1QOrCVVbb7IcTMWR',
    TOKEN_SECRET = '3MiCPNXlYzqNqu2nONYs5AN8ovSoGduMkNQBRsbK7yeZV',
    CONSUMER_KEY = 'WbsMqnQuRqN09O7pulBfMHALr',
    CONSUMER_SECRET = 'IZZmOTjrWmy65EynZmtVR9QJblQgOIalME0nkIqljWXvpcpcPy',
    SIGNATURE_METHOD = 'HMAC-SHA1',
    OAUTH_VERSION = '1.0';


var TwitterTracker = exports.TwitterTracker = function (topics) {
    this.topics = topics;
    this.twitPath = TWITTER_HOST + TWITTER_PATH + '?track=' + this.topics
};

// HEADER GEN

function genAuthHeader(topics) {
    var authValues = [
        // OAuth Values
        new Kvp('oauth_consumer_key', CONSUMER_KEY),
        new Kvp('oauth_nonce', randomString(32)),
        new Kvp('oauth_signature_method', SIGNATURE_METHOD),
        new Kvp('oauth_timestamp', Math.floor(Date.now() / 1000).toString()),
        new Kvp('oauth_token', ACCESS_TOKEN),
        new Kvp('oauth_version', OAUTH_VERSION),
        // Parameters
        new Kvp('track', topics)
    ];

    var authHeader = {Authorization: 'OAuth '};

    for (var i = 0; i < authValues.length; i++) {
        authHeader.Authorization += authValues[i].key + '=' + authValues[i].value + ', '
    }

    // encode the keys and values
    for (var k = 0; k < authValues.length; k++) {
        authValues[k].key = encodeURIComponent(authValues[k].key);
        authValues[k].value = encodeURIComponent(authValues[k].value);
    }

    // Sort alphabetically by encoded keys
    sortByKey(authValues, 'key');

    var paramSigValue = '';
    for (var j = 0; j < authValues.length; j++) {
        paramSigValue += authValues[j].key + '=' + authValues[j].value;
        if (j + 1 < authValues.length) {
            paramSigValue += '&';
        }
    }

    var methodSigValue = 'GET';
    var pathSigValue = TWITTER_HOST + TWITTER_PATH;

    var sigBaseValue = methodSigValue.toUpperCase() + '&';
    sigBaseValue += encodeURIComponent(pathSigValue) + '&';
    sigBaseValue += encodeURIComponent(paramSigValue);

    var signingKey = encodeURIComponent(CONSUMER_SECRET) + '&' + encodeURIComponent(TOKEN_SECRET);

    var sig = crypto.createHmac('sha1', signingKey).update(sigBaseValue).digest('base64');

    authHeader.Authorization += 'oauth_signature=' + sig;

    return authHeader;
}


// The exported value will be an EventEmitter that can be instructed to connect to the twitter steraming API
TwitterTracker.prototype = new EventEmitter();

TwitterTracker.prototype.track = function track() {
    // Create https client that will make the request to twitter api

    var authHeader = genAuthHeader(this.topics);

    var opts = {
        host: TWITTER_HOST,
        port: 80,
        method: 'GET',
        path: encodeURIComponent(this.twitPath),
        headers: genAuthHeader()
    };


    var tracker = this;
    var request = https.request(opts, function (response) {
        response.setEncoding('utf8');
        var body = '';

        // Since the API Streams data, each data response is not gauranteed to be an entire tweet, so we need to
        // cache the data responses until a full tweet has arrived
        response.on('data', function (chunk) {
            body += chunk;
            var tweet, index;
            if ((index = body.indexOf('\r\n') >= -1)) {
                tweet = body.slice(0, index);
                body = body.slice(index + 2);
                if (tweet.length > 0) {
                    try {
                        tweet = JSON.parse(tweet);
                        tracker.emit('tweet', tweet);
                    } catch (error) {
                        console.error('-!- Error while parsing tweet.');
                    }
                }
            }
        })
    });

    // Response from initial connection to streaming API

    request.end();
    return this;
};