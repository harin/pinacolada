var unirest = require('unirest');
var config = require('../config.js');

module.exports = {
    sendLink2: function(to, template,name, link){

        console.log('sending link ------------------->');
          unirest.post('https://api.line.me/v1/events')
            .headers({
                'Content-Type': 'application/json; charset=UTF-8',
                'X-LINE-ChannelToken': 'fp5A+LxKqcYbcMc480+thNjXRY50yjtbN8hQLZCs+yXIDBvfjaBGkSxG+SCGHt9WFI0U9XUE7NNBSf3dvvxommf6VRYr+LcZ06yMu5lL8EgNsV0ID0tqNCfEnhk1LAuaBAnsgN0jlHtLGUDR+/xgNK18BSl7lGXPAT9HRw/DX2c='
            })
            .send({
                "to": to,
                "toChannel": 1341301715,
                "eventType": "137299299800026303",
                "content": {
                    "templateId": template,
                    "linkUriParams": {
                        "linkid" : link
                    },
                    "textParams": {
                        "name": name
                    }
                }
            })
            .end(function (msg) {
                // console.log('done', msg);
            });
    },
    sendLink: function(to, template){

        console.log('sending link ------------------->');
          unirest.post('https://api.line.me/v1/events')
            .headers({
                'Content-Type': 'application/json; charset=UTF-8',
                'X-LINE-ChannelToken': 'fp5A+LxKqcYbcMc480+thNjXRY50yjtbN8hQLZCs+yXIDBvfjaBGkSxG+SCGHt9WFI0U9XUE7NNBSf3dvvxommf6VRYr+LcZ06yMu5lL8EgNsV0ID0tqNCfEnhk1LAuaBAnsgN0jlHtLGUDR+/xgNK18BSl7lGXPAT9HRw/DX2c='
            })
            .send({
                "to": to,
                "toChannel": 1341301715,
                "eventType": "137299299800026303",
                "content": {
                    "templateId": template,
                    "linkUriParams": {
                        "mid": to[0]
                    }
                }
            })
            .end(function (msg) {
                // console.log('done', msg);
            });
    },
    sendText: function (to, text) {
        if (!Array.isArray(to)) {
            throw new Error("Your father died. " + to + '/' + text);
        }
        //to : Array of user, group, or room MIDs who will receive the message.
        //text: string
        unirest.post('https://api.line.me/v1/events')
            .headers({
                'Content-Type': 'application/json; charset=UTF-8',
                'X-LINE-ChannelToken': 'fp5A+LxKqcYbcMc480+thNjXRY50yjtbN8hQLZCs+yXIDBvfjaBGkSxG+SCGHt9WFI0U9XUE7NNBSf3dvvxommf6VRYr+LcZ06yMu5lL8EgNsV0ID0tqNCfEnhk1LAuaBAnsgN0jlHtLGUDR+/xgNK18BSl7lGXPAT9HRw/DX2c='
            })
            .send({
                "to": to,
                "toChannel": 1383378250,
                "eventType": "138311608800106203",
                "content": {
                    "contentType": 1,
                    "toType": 1,
                    "text": text
                }
            })
            .end(function (msg) {
                console.log('done');
            });
    },
    //rid == restaurant id
    sendImage: function (to, restaurant, index) {
    var rid = restaurant.url;
    var schema = {
      "canvas": {
        "width": 1040,
        "height": 1040,
        initialScene: "scene1"
      },
      "images": {
        "image1": {
          "x": 0,
          "y": 0,
          "w": 1040,
          "h": 1040
        }
      },
      "actions": {
        "open": {
          "type": "web",
          "text": "Go to restaurant site",
          "params": {
            "linkUri": "https://www.wongnai.com/" + rid
          }
        }
      },
      "scenes": {
        "scene1": {
          "draws": {
            "images": "image1",
            "x": 0,
            "y": 0,
            "w": 1040,
            "h": 1040
          },
          "listeners": [{
            "type": "touch",
            "params": [0,0,1040,1040],
            "action": "open"
          }]
        }
      }
    };


    //to : Array of user, group, or room MIDs who will receive the message.
    //text: string
    unirest.post('https://api.line.me/v1/events')
        .headers({
            'Content-Type': 'application/json; charset=UTF-8',
            'X-LINE-ChannelToken': 'fp5A+LxKqcYbcMc480+thNjXRY50yjtbN8hQLZCs+yXIDBvfjaBGkSxG+SCGHt9WFI0U9XUE7NNBSf3dvvxommf6VRYr+LcZ06yMu5lL8EgNsV0ID0tqNCfEnhk1LAuaBAnsgN0jlHtLGUDR+/xgNK18BSl7lGXPAT9HRw/DX2c='
        })
        .send({
            "to": to,
            "toChannel": 1383378250,
            "eventType": "138311608800106203",
            "content": {
                "contentType": 12,
                "toType": 1,
                "contentMetadata": {
                  "DOWNLOAD_URL": config.HEROKU + "/" + rid + "/" + index,
                  "SPEC_REV": "1",
                  "ALT_TEXT": "Please visit our restaurant page",
                  "MARKUP_JSON": JSON.stringify(schema)
                } 
            }
        })
        .end(function (msg) {
            console.log('done');
        });
    }
};