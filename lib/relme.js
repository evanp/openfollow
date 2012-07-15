// relme.js
//
// get the rel-me links from an HTML page
//
// Copyright 2012, StatusNet Inc. and others
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

var async = require("async"),
    HTML5 = require("html5"),
    http = require("http"),
    https = require("https"),
    urlParse = require("url").parse;

var RelMe = {
    TypeError: function(type) {
        this.name    = "RelMe.TypeError";
        this.type    = type;
        this.message = "Bad type: " + type;
    },
    HTTPError: function(code) {
        this.name    = "RelMe.HTTPError";
        this.code    = code;
        this.message = "Bad HTTP status code: " + code;
    },
    ProtocolError: function(protocol) {
        this.name     = "RelMe.ProtocolError";
        this.protocol = protocol;
        this.message  = "Unrecognized protocol: " + protocol;
    },
    getLinks: function(url, callback) {

        var parts = urlParse(url),
            options = {
                hostname: parts.hostname,
                port: parseInt(parts.port, 10) || ((parts.protocol == 'https:') ? 443: 80),
                path: parts.path,
                method: 'GET',
                headers: {
                    'User-Agent': 'OpenFollow/0.1.0 (http://openfollow.net/)',
                    'Connection': 'close'
                }
            },
            mod = (parts.protocol == 'http:') ? http : 
                (parts.protocol == 'https:') ? https :
                null;

        if (!mod) {
            callback(new RelMe.ProtocolError(parts.protocol), null);
            return;
        }

        // XXX: use a cache, you big jerk!

        mod.get(options, function(res) {
            var body = "";

            if (res.statusCode !== 200) {
                callback(new RelMe.HTTPError(res.statusCode), null);
                return;
            }

            if (!res.headers['content-type'] || 
                res.headers['content-type'].substr(0, 9) !== 'text/html') {
                callback(new RelMe.TypeError(res.headers['content-type']), null);
                return;
            }

            res.on("data", function(chunk) {
                body = body + chunk;
            });

            res.on("error", function(err) {
                callback(err, null);
            });

            res.on("close", function() {
                callback(new Error("Connection closed prematurely"), null);
            });

            res.on("end", function() {

                var tz, links = {};

                tz = new HTML5.Tokenizer(body);

                tz.on("token", function(tok) {
                    var href = null, isRelMe = false, i, attr, prop, res = [];
                    switch (tok.type) {
                    case 'StartTag':
                        if (tok.name === 'a') {
                            for (i = 0; i < tok.data.length; i++) {
                                attr = tok.data[i];
                                if (attr.nodeName === 'href') {
                                    href = attr.nodeValue;
                                } else if (attr.nodeName === 'rel' && 
                                           attr.nodeValue.split(/\s+/).indexOf('me') !== -1) {
                                    isRelMe = true;
                                }
                            }
                            if (isRelMe && href) {
                                links[href] = 1;
                            }
                        }
                        break;
                    case 'EOF':
                        for (prop in links) {
                            if (links.hasOwnProperty(prop)) {
                                res.push(prop);
                            }
                        }
                        callback(null, res);
                        return;
                    }
                });

                tz.tokenize();
            });
        }).on('error', function(err) {
            console.log("Got to error");
            callback(err, null);
        });
    }
};

// Some housekeeping for our custom classes

RelMe.TypeError.prototype = new Error;
RelMe.TypeError.prototype.constructor = RelMe.TypeError;

RelMe.HTTPError.prototype = new Error;
RelMe.HTTPError.prototype.constructor = RelMe.HTTPError;

RelMe.ProtocolError.prototype = new Error;
RelMe.ProtocolError.prototype.constructor = RelMe.ProtocolError;

module.exports = RelMe;
