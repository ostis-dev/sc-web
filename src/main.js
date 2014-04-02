var sc_web = require("./sc-web/core.js");
var nconf = require("nconf");

nconf.argv()
    .env()
    .file({ file: './config.json' });

sc_web.start(nconf);
