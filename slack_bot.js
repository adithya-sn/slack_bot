//Slack bot which accepts incoming data about deployment type, Jenkins job and branch to be executed on Jenkins. Branch option is exclusively for the backend.

var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var port = 25001;
var build_url = "http://jenkins_url/generic-webhook-trigger/invoke?token=param_token"
var deploy_url = "http://jenkins_url/generic-webhook-trigger/invoke?token=param_token"

// body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));

app.listen(port, function () {
  console.log('Listening on port ' + port);
});

//To check if bot is running. 
app.get('/', function (req, res) { res.status(200).send('Running'); });

//Web
app.post('/web_bot', function (req, res, next) {
var userName = req.body.user_name;
var txt = req.body.text;
var tmpVar = null;
var request = require('request');

var splt = txt
             .replace(/[.,?!;()“’]/g, " ")
             .replace(/\s+/g, " ")
             .split(" ");

var depType = splt[0]
var svcName = splt[1]

//POST back to Jenkins
if ( depType === 'deploy' ) {
tmpVar = 'deployed';
request.post(
    deploy_url,
    { json: { 'svcName': svcName, 'depType': depType } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
}
else if (depType === 'build') {
tmpVar = 'built';
request.post(
    build_url,
    { json: { 'svcName': svcName, 'depType': depType } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
}
else {
tmpVar = 'built & deployed';
request.post(
    build_url,
    { json: { 'svcName': svcName, 'depType': depType } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
}
var botResponse =
{
    text : 'Hello ' + userName +', ' +  svcName + ' service will be ' + tmpVar + '.'
  };
  // Loop otherwise..
  if (userName !== 'slackbot') {
    return res.status(200).json(botResponse);
} else {
    return res.status(200).end();
}
});

//Backend
app.post('/backend_bot', function (req, res, next) {
var git_branch = null;
var userName = req.body.user_name;
var txt = req.body.text;
var tmpVar = null;
var request = require('request');

var splt = txt
             .replace(/[.,?!;()“’]/g, " ")
             .replace(/\s+/g, " ")
             .split(" ");

var depType = splt[0]
var svcName = splt[1]
var git_branch = splt[2]

//Post back to Slack

//Check if all required parameters are entered
if ( git_branch === undefined && depType !== 'deploy' )
{

var botResponse ={text : 'Hey ' + userName + ', ' + 'one or more parameters were not entered correctly. Please try again.'};
if (userName !== 'slackbot') 
{
    return res.status(200).json(botResponse);
} 
else 
{
    return res.status(200).end();
}

}

else{
//For deploy
if ( depType === 'deploy' ) {
tmpVar = 'deployed';
request.post(
    deploy_url,
    { json: {  'depType': depType, 'svcName': svcName, 'Git_Branch': git_branch } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
}
//For build
else if (depType === 'build') {
tmpVar = 'built';
request.post(
    build_url,
    { json: {  'depType': depType, 'svcName': svcName, 'Git_Branch': git_branch } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
}
//For build-deploy
else {
tmpVar = 'built & deployed';
request.post(
    build_url,
    { json: {  'depType': depType, 'svcName': svcName, 'Git_Branch': git_branch } },
    function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    }
);
}
if ( depType !== 'deploy' ){
var botResponse ={text : 'Hey ' + userName +', ' +  svcName + ' will be ' + tmpVar + ' using ' + git_branch + ' branch' + '.'};
}
else {
var botResponse ={text : 'Hey ' + userName +', ' +  svcName + ' will be ' + tmpVar + '.'};
}
if (userName !== 'slackbot') 
{
    return res.status(200).json(botResponse);
} 
else 
{
    return res.status(200).end();
}
}});
