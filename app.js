

var express = require('express');

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
//var watson = require('watson-developer-cloud');
var PIInput = require('personality-insights-input');

/*
var personality_insights = watson.personality_insights({
  username: '07eab940-8bbb-4a8b-a3c6-e39e0bf7bbc5',
  password: '2JXyVO8JZz2B',
  version: 'v3'
});
*/

const personalityinsightv3 = require('watson-developer-cloud/personality-insights/v3');
const fs = require('fs');

const personality_insights = new personalityinsightv3({
  username: "0245842b-3acc-418a-9b7c-430c46115463",
  password: "QxWbyHRMlblI",
  version_date: '2016-10-19'
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

var Redis = require('ioredis');
//var myCache = new Redis(15800,'redis://admin:MJAQPRNVWJIHICAO@bluemix-sandbox-dal-9-portal.3.dblayer.com');

var url = "redis://admin:XFYTGUDZNFVZLKML@bluemix-sandbox-dal-9-portal.5.dblayer.com";
var port = 23121;
var myCache = new Redis(port, url);
var twid = "";
var flavour = "";


flavours=['Splish Splash', 'Fruit Over Load', 'Mississippi Mud', 'Litchi Gold Swirl' ];
var favoriteIcecream = "";
var PersonalityTextSummaries = require('personality-text-summary');
                     
var textSummary = "";

app.post('/showtweets', function(req, res) {
    //console.log("1.........." + req.body.userid);
    var params = req.body.userid;
    
    myCache.get(params, function (err, result) {
      if(result != null) {
         favoriteIcecream = result;
         //console.log("Flavour:" + result);
         //console.log("Flavour:" + flavour);
         //console.log("FavouriteIcecream" +favoriteIcecream);
      }
      else {
          //console.log('Give a new ice cream');
          var num = Math.floor( Math.random() * flavours.length );
          flavour = flavours[ num ];
          favoriteIcecream = flavour;
          myCache.set(params,flavour, function( err, success ){
            if( !err && success ){
            //console.log( "Added Ice Cream to cache" );
            //console.log("---"+ params + "Flavour" + flavour);
            }
          });
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

                      fs.writeFile('./public/personality.json', myAnalysisJson, function(err) {
                          if (err) return 
                          //console.log('File written to filesystem');
                          var myV3EnPersonalityProfile = require('./public/personality.json');
                          var v3EnglishTextSummaries = new PersonalityTextSummaries({ locale: 'en', version: 'v3' });
                          textSummary  = v3EnglishTextSummaries.getSummary(myV3EnPersonalityProfile);
                          //console.log(textSummary);
                      });

       

                      res.render('sunburst', {
                          analyze: favoriteIcecream , 
                          textSummary : textSummary
                          
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



