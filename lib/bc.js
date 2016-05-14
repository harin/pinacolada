var unirest = require('unirest');

module.exports = {
    sendText: function (to, text) {
        //to : Array of user, group, or room MIDs who will receive the message.
        //text: string
        unirest.post('https://api.line.me/v1/events')
            .headers({
                'Content-Type': 'application/json; charset=UTF-8',
                'X-LINE-ChannelToken': 'GVkmAjF35ITv/o+20viSyJ3llXhudOoQATN85TxReCihmYLI0TdcyAOoU+kmAXVZFI0U9XUE7NNBSf3dvvxommf6VRYr+LcZ06yMu5lL8EgvJzXgPp7lcmUKUa6mJR3EKloHD0ie/kZNvjxtSXRVrq18BSl7lGXPAT9HRw/DX2c='
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
                res.send("OK");
            });

    },
    sendImage: function () {

    }
};