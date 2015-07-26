var request = require('request');
var fuse = require('./fuse.js');
var colors = require('./colors.js');
var _ = require('lodash');

// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
  try {
    console.log("event.session.application.applicationId=" + event.session.application.applicationId);

    /**
     * Uncomment this if statement and populate with your skill's application ID to
     * prevent someone else from configuring a skill that sends requests to this function.
     */
    /*
    if (event.session.application.applicationId !== "amzn1.echo-sdk-ams.app.[unique-value-here]") {
       context.fail("Invalid Application ID");
     }
    */

    if (event.session.new) {
      onSessionStarted({requestId: event.request.requestId}, event.session);
    }

    if (event.request.type === "LaunchRequest") {
      onLaunch(event.request,
           event.session,
           function callback(sessionAttributes, speechletResponse) {
            context.succeed(buildResponse(sessionAttributes, speechletResponse));
           });
    }  else if (event.request.type === "IntentRequest") {
      onIntent(event.request,
           event.session,
           function callback(sessionAttributes, speechletResponse) {
             context.succeed(buildResponse(sessionAttributes, speechletResponse));
           });
    } else if (event.request.type === "SessionEndedRequest") {
      onSessionEnded(event.request, event.session);
      context.succeed();
    }
  } catch (e) {
    context.fail("Exception: " + e);
  }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
  console.log("onSessionStarted requestId=" + sessionStartedRequest.requestId
        + ", sessionId=" + session.sessionId);
}

/**
 * Called when the user launches the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
  console.log("onLaunch requestId=" + launchRequest.requestId
        + ", sessionId=" + session.sessionId);

  // Dispatch to your skill's launch.
  getWelcomeResponse(callback);
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {
  console.log("onIntent requestId=" + intentRequest.requestId
        + ", sessionId=" + session.sessionId);

  var intent = intentRequest.intent,
    intentName = intentRequest.intent.name;

  // Dispatch to your skill's intent handlers
  if ("MyColorIsIntent" === intentName) {
    setColorInSession(intent, session, callback);
  } else {
    throw "Invalid intent";
  }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {
  console.log("onSessionEnded requestId=" + sessionEndedRequest.requestId
        + ", sessionId=" + session.sessionId);
  // Add cleanup logic here
}

// --------------- Functions that control the skill's behavior -----------------------

function getWelcomeResponse(callback) {
  // If we wanted to initialize the session to have some attributes we could add those here.
  var sessionAttributes = {};
  var cardTitle = "Welcome";
  var speechOutput = "What color?";
  // If the user either does not reply to the welcome message or says something that is not
  // understood, they will be prompted again with this text.
  var repromptText = "What color would you like the lights?";
  var shouldEndSession = false;

  callback(sessionAttributes,
       buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
}

/**
 * Sets the color in the session and prepares the speech to reply to the user.
 */
function setColorInSession(intent, session, callback) {
  var cardTitle = intent.name;
  var favoriteColorSlot = intent.slots.Color;
  var repromptText = "";
  var sessionAttributes = {};
  var shouldEndSession = true;
  var speechOutput = "";

  if (favoriteColorSlot) {
    favoriteColor = matchColor(favoriteColorSlot.value);
  }

  if (favoriteColor) {
    speechOutput = "Changing to " + favoriteColor.name;
    repromptText = "";
    postColor(favoriteColor.hex, callbackClosure);
  } else {
    speechOutput = "I'm not sure what color you want the lights, please try again";
    repromptText = "What color would you like the lights?";
    callbackClosure();
  }

  function callbackClosure(request) {
    console.log(request);
    callback(sessionAttributes,
         buildSpeechletResponse(cardTitle, speechOutput, repromptText, shouldEndSession));
  }
}

function matchColor(speech) {
  var match;
  var options = {
    keys: ['name'],
    threshold: 0.4,
    includeScore: true
  };
  var f = new fuse(colors.colors, options);
  var result = f.search(speech);

  var exactMatches = _.filter(result, function (item) {
    return item.score === 0;
  });

  if (exactMatches.length) {
    match = _.filter(exactMatches, function (match) {
      return match.item.name.length === speech.length;
    })[0].item;
  } else if (result.length) {
    match = result[0].item;
  }

  return match;
}

function postColor(color, callback) {
  if (color.toLowerCase() === 'loop') {
    request.post({
      url: 'https://maker.ifttt.com/trigger/hue_color_loop/with/key/dUx1De2fiVVHUKial8Qtkc',
      json: true,
      body: {
      }
    }, callback);
  } else {
    request.post({
      url: 'https://maker.ifttt.com/trigger/hue_color_change/with/key/dUx1De2fiVVHUKial8Qtkc',
      json: true,
      body: {
        'value1': color
      }
    }, callback);
  }
}

// --------------- Helpers that build all of the responses -----------------------

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
  return {
    outputSpeech: {
      type: "PlainText",
      text: output
    },
    card: {
      type: "Simple",
      title: "SessionSpeechlet - " + title,
      content: "SessionSpeechlet - " + output
    },
    reprompt: {
      outputSpeech: {
        type: "PlainText",
        text: repromptText
      }
    },
    shouldEndSession: shouldEndSession
  };
}

function buildResponse(sessionAttributes, speechletResponse) {
  return {
    version: "1.0",
    sessionAttributes: sessionAttributes,
    response: speechletResponse
  };
}