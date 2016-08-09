const debug = require('debug')('node-telegram-bot-api');
const https = require('https');
const http = require('http');
const fs = require('fs');
const bl = require('bl');
const _ = require("lodash");

class ExternalBotWebHook {

  constructor(secret, options, callback) {
    this.secret = secret;
    this.callback = callback;
    this.regex = new RegExp(this.secret);

    // define opts
    if (typeof options === 'boolean') {
      options = {}; // eslint-disable-line no-param-reassign
    }
    options.port = options.port || 8443;

    debug('HTTP WebHook enabled');
  }

  // used so that other funcs are not non-optimizable
  _safeParse(json) {
    try {
      return JSON.parse(json);
    } catch (err) {
      debug(err);
      return null;
    }
  }

  // pipe+parse body
  _parseBody = (body) => {
    var data;
    if (_.isObject(body)) {
        data = body;
    } else if (_.isString(body)) {
        data = this._safeParse(body);
    } else {
        data = null;
    }

    if (data) {
      return this.callback(data);
    }

    return null;
  }

  // bound req listener
  _requestListener = (req, res) => {
    debug('WebHook request URL:', req.url);
    debug('WebHook request headers: %j', req.headers);

    // If there isn't token on URL
    if (!this.regex.test(req.url)) {
      debug('WebHook request unauthorized');
      res.statusCode = 401;
      res.end();
    } else if (req.method === 'POST') {
      this._parseBody(req.body);
      res.end("OK");
    } else {
      // Authorized but not a POST
      debug('WebHook request isn\'t a POST');
      res.statusCode = 418; // I'm a teabot!
      res.end();
    }
  }

}

module.exports = ExternalBotWebHook;
