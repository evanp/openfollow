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
    urlParse = require("url").parse;

var RelMe = {
    getLinks: function(url, callback) {
        var parts = urlParse(url);
        async.waterfall([
            function(cb) {
                var port = parseInt(parts.port, 10) || (parts.protocol === 'https:') ? 443: 80,
                    options = {
                        hostname: parts.hostname,
                        path: parts.path,
                        method: 'GET',
                        headers: {
                            'connection': 'close',
                            'user-agent': 'OpenFollow/0.1.0 (http://openfollow.net/)'
                        }
                    };

                // XXX: use a cache, you big jerk!
                http.get(options, function(res) {
                    cb(null, res);
                }).on('error', function(err) {
                    cb(err, null);
                });
            },
            function(res, cb) {

                var tz, links = [];

                if (res.statusCode !== 200) {
                    cb(new Error("Bad response code: " + res.statusCode), null);
                    return;
                }

                if (!res.headers['content-type'] || 
                    res.headers['content-type'].substr(0, 9) !== 'text/html') {
                    cb(new Error("Not HTML"), null);
                    return;
                }

                tz = new HTML5.Tokenizer(res);

                tz.on("token", function(tok) {
                    var href = null, isRelMe = false, i, attr;
                    switch (tok.type) {
                        case 'StartTag':
                        if (tok.name === 'a') {
                            for (i = 0; i < tok.data.length; i++) {
                                attr = tok.data[i];
                                if (attr.nodeName === 'href') {
                                    href = attr.nodeValue;
                                } else if (attr.nodeName === 'rel' && 
                                           attr.nodeValue === 'me') {
                                    isRelMe = true;
                                }
                            }
                            if (isRelMe && href) {
                                links.push(href);
                            }
                        }
                        break;
                        case 'EOF':
                        cb(null, links);
                        return;
                    }
                });

                tz.tokenize();
            }
        ], callback);
    }
};

module.exports = RelMe;
