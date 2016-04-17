(function () {
    'use strict';

    var fs = require('fs');
    var https = require('https');
    var request = require('request');
    var express = require('express');
    var bodyParser = require('body-parser');

    module.exports = (function () {
        var api = {
            send: {
                method: 'post',
                path: '/v1/events'
            },
            info: {
                method: 'get',
                path: '/v1/bot'
            }
        };

        var help = {
            receiver: 'https://developers.line.me/bot-api/getting-started-with-bot-api-trial#receiving_messages_operations'
        };

        function lineBot(options) {
            var app;

            // sendMessage
            this._endpoint = options.endpoint || 'https://trialbot-api.line.me';
            this._headers =  {
                'Content-Type': 'application/json; charset=UTF-8',
                'X-Line-ChannelID': options.id,
                'X-Line-ChannelSecret': options.secret,
                'X-Line-Trusted-User-With-ACL': options.mid
            };

            // receiveMessage
            app = express();
            app.set('x-powered-by', false);
            app.use(bodyParser.json());
            app.route('/').get(function (req, res) { res.send('lineBot ready'); });
            app.route('/receiver')
               .post(this._onReceiveMessage.bind(this))
               .get(function (req, res) {
                    res.send('Access in POST method. \n<br>See <a href="' + help.receiver + '">the developer document</a>');
               });
            
            this._server = https.createServer({
                key: fs.readFileSync(options.server.key),
                cert: fs.readFileSync(options.server.cert)
            }, app).listen(options.server.port || 443);

            this._eventHandlers = {};
        }

        lineBot.prototype._onReceiveMessage = function (req, res) {
            res.sendStatus(200);
            this.trigger('message', req.body);
        };

        lineBot.prototype._getSendMessageParam = function (to, content) {
            var params = {
                to: (to instanceof Array) ? to : [to],
                toChannel: 1383378250,
                eventType: '138311608800106203',
                content: content
            };

            return JSON.stringify(params);
        };

        lineBot.prototype.sendMessage = function (to, msg) {
            var params = this._getSendMessageParam(to, {
                contentType: 1,
                toType: 1,
                text: msg
            });

            return new Promise(function (resolve, reject) {
                request({
                    method: api.send.method,
                    uri: this._endpoint + api.send.path,
                    headers: this._headers,
                    body: params
                }, function (err, res, body) {
                    try {
                        if (!err && res.statusCode === 200) {
                            resolve(JSON.parse(body || '{}'));
                        } else {
                            reject(JSON.parse(body || '{}'));
                        }
                    } catch (e) {
                        reject(body);
                    }
                });
            });
        };

        lineBot.prototype.on = function (eventName, callback) {
            this._eventHandlers[eventName] = this._eventHandlers[eventName] || [];
            this._eventHandlers[eventName].push(callback);
        };

        lineBot.prototype.trigger = function (eventName, data) {
            var handlers = this._eventHandlers[eventName];

            if (!handlers || handlers.length < 1) {
                return;
            }

            handlers.forEach(function (handler) {
                handler(data);
            });
        };

        lineBot.prototype.destroy = function () {
            this._server.close();
        };

        return lineBot;
    })();
}).call(this);

