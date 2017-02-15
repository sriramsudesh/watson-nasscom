

console.log("Hello World ");


var fs = require('fs');
var PersonalityTextSummaries = require('personality-text-summary');
var myV3EnPersonalityProfile = require('./public/personality.json');
var v3EnglishTextSummaries = new PersonalityTextSummaries({ locale: 'en', version: 'v3' });
textSummary  = v3EnglishTextSummaries.getSummary(myV3EnPersonalityProfile);
console.log(textSummary);

