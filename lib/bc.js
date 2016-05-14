var unirest = require('unirest');

module.exports = {
    sendLink: function(to, link){
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
                    "templateId": "template1",
                    "linkUriParams": {
                        "lu_p": "5550"
                    }
                }
            })
            .end(function (msg) {
                console.log('done', msg);
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
    sendImage: function () {

    }
};