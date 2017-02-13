


var Redis = require('ioredis');
var myCache = new Redis(15800,'redis://admin:MJAQPRNVWJIHICAO@bluemix-sandbox-dal-9-portal.3.dblayer.com');

var twid = "";
var flavour = "";

var flavours=['Splish Splash', 'Fruit Over Load', 'Mississippi Mud', 'Litchi Gold Swirl' ];
var icecreamobject  = { twid: twid, flavour: flavour};

function HasIceCreamGivenBefore(twitterID, callback) {
  myCache.get(twitterID, function( err, icecreamobject){
      if( !err ){
          callback(icecreamobject);
       }
       else
       {
        callback(error);
       }
    
  });
}

function GiveIceCream(twitterID , callback) {
  var num = Math.floor( Math.random() * flavours.length );
  var img = flavours[ num ];
  icecreamobject = { twid: twitterID, flavour: img};
  console.log("Putting the icecreamflavour + "  + icecreamobject.flavour);
  myCache.set( twitterID, icecreamobject, function( err, success ){
      if( !err && success ){
        console.log( "Added Ice Cream to cache" );
        console.log(icecreamobject.img + "---"+ icecreamobject.twitterID);
        callback(icecreamobject);
      }
  });
}
twid = process.argv[2];

console.log(twid);

HasIceCreamGivenBefore(twid,function(response) {
  console.log(response);
     if(response === undefined || response === null) { 
          console.log('Trying to give a new ice cream');
          GiveIceCream(twid, function(err, icecreamobject) {
            console.log("Icecream Added...");
          });
      }
     
});

