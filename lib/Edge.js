// Edge class

var databank = require("databank"),
    Identifier = require("./Identifier"),
    NoSuchThingError = databank.NoSuchThingError,
    DatabankObject = databank.DatabankObject;

var Edge = DatabankObject.subClass("edge");

Edge.schema = {pkey: "fromto",
               fields: ["from", "to", "source", "created", "modified"],
               indices: ["from", "to"]
              };

Edge.makeFromTo = function(from, to) {
    return from + "➡" + to;
};

Edge.beforeCreate = function(props, callback) {

    if (!props.from || !props.to) {
        callback(new Error("Need 'from' and 'to'"), null);
        return;
    }

    props.from = Identifier.canonical(props.from);
    props.to = Identifier.canonical(props.to);

    props.fromto = Edge.makeFromTo(props.from, props.to);
    props.created = props.modified = Date.now();
    callback(null, props);
};

Edge.prototype.afterCreate = function(callback) {
    var edge = this;

    // XXX: whitelist some sources

    // check for an edge in the opposite direction
    Edge.get(Edge.makeFromTo(edge.to, edge.from), function(err, edge) {
        if (err && err instanceof NoSuchThingError) {
            callback(null);
        } else if (err) {
            callback(err);
        } else {
            // mutual pointage == unify
            Identifier.unify(edge.from, edge.to, function(err, uuid) {
                if (err) {
                    callback(err);
                } else {
                    callback(null);
                }
            });
        }
    });
};

module.exports = Edge;
