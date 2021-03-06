// server.js
// where your node app starts
// init project
var express = require('express');
var app = express();

// init Spotify API wrapper
var SpotifyWebApi = require('spotify-web-api-node');
var redirectUri = 'https://' + process.env.PROJECT_NAME + '.glitch.me/callback';
var tokenExpirationEpoch;
var spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: redirectUri
});



// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {

    response.sendFile(__dirname + '/views/index.html');
});

app.get("/authorize", function (request, response) {
    var scopesArray = request.query.scopes.split(',');
    var authorizeURL = spotifyApi.createAuthorizeURL(scopesArray);
    console.log(authorizeURL)
    response.send(authorizeURL);
});

app.get('/getMe', function (req, res) {

    spotifyApi.getMe()
        .then(function (data) {

            res.send(data)
        }, function (err) {

            console.error(`error`, err);
            res.send(err)
        });

})

app.get('/playing', function (req, res) {
    spotifyApi.getMyCurrentPlaybackState({})
        .then(function (data) {
            // Output items
            console.log("Now Playing: ", data.body);
            res.send(data)
        }, function (err) {
            console.log('Something went wrong!', err);
            res.send(err)
        });

})
// Exchange Authorization Code for an Access Token
app.get("/callback", function (request, response) {
    var authorizationCode = request.query.code;

    // Check folks haven't just gone direct to the callback URL
    if (!authorizationCode) {
        response.redirect('/');
    } else {
        response.sendFile(__dirname + '/views/callback.html');
    }

    spotifyApi.authorizationCodeGrant(authorizationCode)
        .then(function (data) {

            // Set the access token and refresh token
            spotifyApi.setAccessToken(data.body['access_token']);
            spotifyApi.setRefreshToken(data.body['refresh_token']);

            // Save the amount of seconds until the access token expired
            tokenExpirationEpoch = (new Date().getTime() / 1000) + data.body['expires_in'];
            console.log('Retrieved token. It expires in ' + Math.floor(tokenExpirationEpoch - new Date().getTime() / 1000) + ' seconds!');

        }, function (err) {
            console.log('Something went wrong when retrieving the access token!', err.message);
        });
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
});