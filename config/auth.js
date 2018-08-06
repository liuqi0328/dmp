// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {
    'facebookAuth': {
        'clientID': '438944409924861        ', // your App ID
        'clientSecret': '23c277c009b94e95bfa33cb14a0716b6', // your App Secret
        'callbackURL': 'http://localhost:8080/auth/facebook/callback',
        'profileURL': 'https://graph.facebook.com/v2.5/me?fields=first_name,last_name,email',
        'profileFields': ['id', 'email', 'name'] // For requesting permissions from Facebook API

    },

    'twitterAuth': {
        'consumerKey': 'uxuXRxylKaTLioGMgsW2ItufP',
        'consumerSecret': '0baKUP5IyPOdvW1Nh8Dcpyxddyr29zMocmUJWI8IpLBgpX11Ad',
        'callbackURL': 'http://127.0.0.1:8080/auth/twitter/callback',
    },

    'googleAuth': {
        'clientID': 'your-secret-clientID-here',
        'clientSecret': 'your-client-secret-here',
        'callbackURL': 'http://localhost:8080/auth/google/callback',
    },

    'amazonAuth': {
        'clientID': 'AMAZON_CLIENT_ID',
        'clientSecret': 'AMAZON_CLIENT_SECRET',
        'callbackURL': 'http://127.0.0.1:3000/auth/amazon/callback',
    },
};