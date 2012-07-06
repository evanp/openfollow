// Identifier class

var url = require('url'),
    databank = require('databank'),
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

module.exports = Identifier;

