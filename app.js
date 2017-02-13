

var express = require('express');
var fs = require('fs');
var cfenv = require('cfenv');
var ejs = require('ejs');
var bodyParser = require('body-parser');

var Twitter = require('twitter');

var app = express();
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(express.static('public'));


var appEnv = cfenv.getAppEnv();
var watson = require('watson-developer-cloud');
var PIInput = require('personality-insights-input');
var personality_insights = watson.personality_insights({
  username: '07eab940-8bbb-4a8b-a3c6-e39e0bf7bbc5',
  password: '2JXyVO8JZz2B',
  version: 'v2'
});
var clientWeb = new Twitter({
  consumer_key: 'PjrA4FgQgMW3Gmro4M8y4PpzW',
  consumer_secret: '4YkPJScwV3LmPWyyFhav223GiiIJR8EXZkKFgj2FjctqKqPH2r',
  access_token_key: '44065780-uSoFtehbnbkmBEqzVg4Bpyy5jgi6Nn2MQsyGkzpyz',
  access_token_secret: 'P09YYPCdyTYU0Y7ki7nxrLhChIQhzbsce4ZyyMzKWp8gZ'
});


var client = new Twitter({
  consumer_key: 'A82ErzPqHXHJPeujcVX470ecv',
  consumer_secret: 'DNW3G3CYh8EukqkF9k7oyx41W1aBmrbGOs5WTfjLVy7kIC0Q1B',
  access_token_key: '44065780-v6kE3h7OkrvXa2DzBQPAVJXqzE522AlZOQRqjLSv3',
  access_token_secret: 'm2SCZ4oTUtztfXBXzWUMoPf0zDzKJm8fcaeexCgW2Sx1B'
});


app.get('/', function(req, res) {
  var result = "";
  myanalysis = "" ;
  res.render('index', {analyze: myanalysis });
  
});

function prepareTweets(params, callback) {
  var myAnalysisJson;
  var innerparam = {screen_name: params};
  client.get('statuses/user_timeline', innerparam, function(error, tweets, response) {
      if (!error) {
        //console.log(tweets);
         inputFromTweets = PIInput.fromTweets(tweets);
         mytweets = JSON.stringify(inputFromTweets, null, 2);
       //console.log(inputFromTweets);

        callback(mytweets);
      }
     
  });
}
    
function analyzePerson(params, callback) {
  var myAnalysisJson;
  personality_insights.profile(params, function(error, response) {
      if (error) {
        callback(error);
      }
   myAnalysisJson = JSON.stringify(response, null, 2);
   callback(myAnalysisJson); 
  }); 

}  

function twitterAccountExists($username){
    $headers = get_headers("https://twitter.com/".$username);
    if(strpos($headers[0], '404') !== false ) {
        return false;
    } else {
        return true;
    }
}

/*
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 100, checkperiod: 120 } );
*/


var Redis = require('ioredis');
//var myCache = new Redis(15800,'redis://admin:MJAQPRNVWJIHICAO@bluemix-sandbox-dal-9-portal.3.dblayer.com');

var url = 'redis://admin:NWAFWQLARTCIOGPT@bluemix-sandbox-dal-9-portal.1.dblayer.com';
var port = 23093
var myCache = new Redis(port, url);

flavours=['Splish Splash', 'Fruit Over Load', 'Mississippi Mud', 'Litchi Gold Swirl' ];


icecreamobject = { key: 'ksudesh', flavour: 'Fruit Over Load'};
favoriteIcecream = 'Fruit Over Load';

function HasIceCreamGivenBefore(twitterID, callback) {
  myCache.get(twitterID, function( err, icecreamobject){
      if( !err ){
          
          callback(icecreamobject);
          }
          else
          {
            console.log("Throw this error !");
           callback(error);
          }
    
  });

}


function GiveIceCream(twitterID , callback) {
  var num = Math.floor( Math.random() * flavours.length );
  var img = flavours[ num ];
  icecreamobject = { key: twitterID, flavour: img};
  console.log(icecreamobject);
  myCache.set( twitterID, icecreamobject, function( err, success ){
      if( !err && success ){
        console.log( "Added Ice Cream to cache" );
        console.log(icecreamobject);
        callback(icecreamobject);
      }
  });

}



app.post('/showtweets', function(req, res) {
    console.log("1.........." + req.body.userid);
    var params = req.body.userid;
    HasIceCreamGivenBefore(params,function(response) {
      if(response === undefined) { 
        console.log('Trying to give a new ice cream');
          GiveIceCream(params, function(response) {
           
              icecreamobject = response;
              console.log("New flavour return to the new user " + icecreamobject.flavour);
              favoriteIcecream = icecreamobject.flavour
          });
      }
      else {
        console.log("It reaches when response is null" + response);
          icecreamobject  = response;
           console.log("Flavour return to the old user " + icecreamobject.flavour);
           favoriteIcecream = icecreamobject.flavour;
          
      }
      });

      
        
        prepareTweets(params, function(mytweets) {
                  if(mytweets.length > 300) { 
                      var tweetprepareparam = {  text: mytweets };
                  
                 personality_insights.profile(tweetprepareparam, function(error, response) {
                      if (error) {
                          console.log(error);
                      }
                      myAnalysisJson = JSON.stringify(response, null, 2);
                     
                      res.render('sunburst', {
                          analyze: favoriteIcecream
                      });
                      fs.writeFile('./public/personality.json', myAnalysisJson, function(err) {
                          if (err) return console.log(err);
                          console.log('Writtent the file');
                      });

                  });
              }
              else {

                res.render('index',{analyze : ' Not enough tweets for analysis. Would you like to try with a celebrity twitter handle ?'});
              }

        });

  });

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
