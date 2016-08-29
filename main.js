var http = require('http');
var io = require('socket.io');
var twitter = require('./twitter');

var SERVER_PORT = 8124,
    TWITTER_TOPICS='elon musk';

var server = http.createServer();

server.listen(SERVER_PORT);

var socket = io.listen(server, function (client) {
    // new socket.io client connected
    console.log("New Socket Client Connected");
});

console.log('Server running on port: ' + SERVER_PORT);

var tracker = new twitter.TwitterTracker(TWITTER_TOPICS);

tracker.track().on('tweet', function (tweet) {
    console.log('New tweet from :"' + tweet.user.screen_name + '" -> ' + tweet.text);
});