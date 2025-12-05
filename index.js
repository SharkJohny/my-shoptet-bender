#!/usr/bin/env node

import browserSync from 'browser-sync';
import command from './cli.js';
import fs from 'fs';

const configs = JSON.parse(fs.readFileSync('./config.json', 'utf8'));

command.parse(process.argv);

const options = command.opts();

const configName = options.config || "default";
const config = configs[configName];
if (!config) {
    console.error(`Configuration "${configName}" not found.`);
    process.exit(1);
}

const blankModeStyle = {
    match: /<link rel="stylesheet" media="all" href="https:\/\/cdn\.myshoptet\.com.*>/i,
    fn: function () { return ('');},
}

const blankModeScript = {
    match: /<script src="https:\/\/cdn.myshoptet.com.*>/i,
    fn: function () { return ('');},
};

const runDelBenderScript = {
  match: new RegExp("<script id='"+config.deleteJsFile+"'.*>", "i"),
  fn: function () {
    return ('');
  },
};
const runDelBenderScript2 = {
  match: new RegExp("<script id='"+config.deleteJsFile2+"'.*>", "i"),
  fn: function () {
    return ('');
  },
};
const blankModeCss = {
  match: new RegExp("<link id='"+config.deleteCssFile+"'.*>", "i"),
  fn: function () { return (''); },
};

const scriptStyle = {
    match: /<\/body>(?![\s\S]*<\/body>[\s\S]*$)/i,
    fn: function (req, res, match) {
        return (
            '<script type="module" src="'+config.jsFileName+'"></script><link rel="stylesheet" href="'+config.cssFileName+'">' +
            match
        );
    },
}

const rewriteRules = [
    {...scriptStyle},
    {...runDelBenderScript },
    {...runDelBenderScript2 },
    {...blankModeCss },
    {...(options.blankMode && blankModeStyle)},
    {...(options.blankMode && blankModeScript)}
];

const bs = browserSync.create();
bs.init({
    proxy: { target: options.remote ?? config.defaultUrl },
    watch: options.watch,
    files: [options.folder ? './' + options.folder + '/*' : config.defaultFolder + '/*'],
    serveStatic: [options.folder ?? config.defaultFolder],
    rewriteRules: rewriteRules.filter(
        (value) => Object.keys(value).length !== 0
    ),
    port: 3010,
    notify: options.notify
});
