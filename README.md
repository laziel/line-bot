Node.js module to interact with official LINE Bot API.

- An ID, MID and Secret needed from [LINE Developers](https://developers.line.me/bot-api/overview).
- SSL Certification and key file needed to serve callback URL.

```
npm install line-bot
```

```javascript
var LineBot = require('line-bot');
var bot = new LineBot({
    id: 'YOUR_BOT_ID',
    mid: 'YOUR_BOT_MID',
    secret: 'YOUR_BOT_SECRET',
    server: {
        port: 3000, // Any port number to serve callback URL. root permission required to use under 1024.
        key: 'your-cert.key',
        cert: 'your-cert.crt'
    }
});

// Any kind of message
bot.on('message', function (msg) {
    bot.sendMessage(msg.from, msg.text); 
});
```
