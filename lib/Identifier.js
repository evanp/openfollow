// Identifier class

var url = require('url'),
    async = require('async'),
    databank = require('databank'),
    NoSuchThingError = databank.NoSuchThingError,
    DatabankObject = databank.DatabankObject;

var Identifier = DatabankObject.subClass("identifier");

Identifier.schema = {pkey: "id",
                     fields: ["person", "type", "created", "modified"],
                     indices: ["person"]
                    };

Identifier.beforeCreate = function(props, callback) {
    props.id = Identifier.canonical(props.id);
    // Timestamp
    props.modified = props.created = Date.now();
    callback(null, props);
};

Identifier.beforeUpdate = function(props, callback) {
    // Can't overwrite these properties
    if (props.id) {
        delete props.id;
    }
    if (props.created) {
        delete props.created;
    }
    // Timestamp
    props.modified = Date.now();
    callback(null, props);
};

Identifier.beforeSave = function(callback) {
    this.modified = Date.now();
    callback(null);
};

// To the extent possible, makes uris canonical

Identifier.canonical = function(uri) {

    var parts;

    if (uri.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i)) {
        // It's email-ish
        return uri.toLowerCase();

    } else {

        parts = url.parse(uri);

        if ((parts.protocol === "http:" && parts.port === '80') ||
            (parts.protocol === "https:" && parts.port === '443')) {
            delete parts.port;
            parts.host = parts.hostname;
        }

        // Twitter

        if (parts.hostname === 'www.twitter.com') {
            parts.hostname = 'twitter.com';
            parts.host = parts.hostname;
        }

        if (parts.hostname === 'twitter.com') {

            parts.protocol = "https:";

            if (parts.pathname === "/" && parts.hash && parts.hash.match(/^#!/)) {
                parts.pathname = parts.hash.substring(2);
                delete parts.hash;
                if (parts.search) {
                    parts.path = parts.pathname + parts.search;
                }
            }

            // trim final "/"

            if (parts.pathname.substring(parts.pathname.length - 1) === "/") {
                parts.pathname = parts.pathname.substring(0, parts.pathname.length - 1);
            }
        }

        return url.format(parts);
    }
};

// Unify two identifiers so they identify the same person

Identifier.unify = function(id0, id1, callback) {

    var Person = require("./Person"),
        getter = function(id) {
            return function(callback) {
                Identifier.get(id, function(err, identifier) {
                    if (err) {
                        if (err instanceof NoSuchThingError) {
                            callback(null, null);
                        } else {
                            callback(err, null);
                        }
                    } else {
                        callback(null, identifier);
                    }
                });
            };
        },
        creator = function(id, uuid) {
            return function(callback) {
                Identifier.create({id: id, person: uuid}, callback);
            };
        },
        returner = function(id, cb) {
            cb(null, id.person);
        };

    async.waterfall([
        function(cb) {
            async.parallel([
                getter(id0),
                getter(id1)
            ], cb);
        },
        function(objs, cb) {
            var person;

            if (!objs[0] && !objs[1]) { // neither bound
                async.waterfall([
                    function(cb) {
                        Person.create({}, cb);
                    },
                    function(p, cb) {
                        person = p;
                        async.parallel([
                            creator(id0, p.uuid),
                            creator(id1, p.uuid)
                        ], cb);
                    },
                    function(ids, cb) {
                        cb(null, person.uuid);
                    }
                ], cb);
            } else if (!objs[1]) { // first bound, not second
                async.waterfall([
                    creator(id1, objs[0].person),
                    returner
                ], cb);
            } else if (!objs[0]) { // second bound, not first
                async.waterfall([
                    creator(id0, objs[1].person),
                    returner
                ], cb);
            } else if (objs[0].person === objs[1].person) { // both bound, same
                cb(null, objs[0].person);
            } else { // both bound, different
                cb(new Error("Can't unify: both already bound to different people"), null);
            }
        }
    ], callback);
};

module.exports = Identifier;

