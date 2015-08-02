#!/usr/bin/env node

function postProcess(json) {
    var className, classMeta;

    for (className in json.classes) {
        if (json.classes.hasOwnProperty(className)) {
            classMeta = json.classes[className];
            if (classMeta.pseudo) {
                console.log(className, 'is an element');
            }
        }
    }
}

function run() {
    var yuidoc, json, builder,
        Y = require('yuidocjs'),
        options = Y.Options(Y.Array(process.argv, 2));

    options = Y.Project.init(options);

    if (options.server) {
        Y.Server.start(options);
    } else {
        yuidoc = (new Y.YUIDoc(options));

        Y.DocParser.DIGESTERS['pseudo'] = function (tagname, value, target, block) {
            target.pseudo = true;
        };

        json = yuidoc.run();

        postProcess(json);

        options = Y.Project.mix(json, options);

        if (!options.parseOnly) {
            builder = new Y.DocBuilder(options, json);
            builder.compile();
        }
    }
}

run();