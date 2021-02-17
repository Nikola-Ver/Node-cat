const { dir } = require('console');
const fs = require('fs');
const colors = require('./colors');
const argv = process.argv;

let headerColor = colors.FgCyan;
let contentColor = colors.FgWhite;

if (/colors: /gi.exec(argv[argv.length - 1]) !== null) {
  const [newHeaderColor, newContentColor] = argv[argv.length - 1]
    .match(/(?<=colors: ).*/gi)[0]
    .split(' ');

  headerColor = colors[newHeaderColor] || headerColor;
  contentColor = colors[newContentColor] || contentColor;

  argv.pop();
}

let flagAwait = false;

if ('await' === argv[argv.length - 1].toLowerCase()) {
  flagAwait = true;
  argv.pop();
}

let regExp = null;
let colorRegExpResult = colors.FgGreen;

if (/search color: /gi.exec(argv[argv.length - 1]) !== null) {
  const [newColorRegExpResult] = argv[argv.length - 1].match(
    /(?<=search color: ).*/gi
  );
  colorRegExpResult = colors[newColorRegExpResult] || colorRegExpResult;

  argv.pop();
}

if (/search: /gi.exec(argv[argv.length - 1]) !== null) {
  [regExp] = argv[argv.length - 1].match(/(?<=search: ).*/gi);
  let [flags] = regExp.match(/(?<=\/)[gimyus]+$/gi) || 'g';
  regExp = regExp.replace(/^[^\/]*\//, '').replace(/\/[gimyus]+$/i, '');

  try {
    regExp = new RegExp(regExp, flags);
  } catch {
    regExp = null;
    console.log(`${colors.FgRed}Invalid regex\n`);
  }

  argv.pop();
}

(async () => {
  for (let i = 2; i < argv.length; ++i) {
    try {
      if (!fs.statSync(argv[i]).isFile()) continue;
    } catch {
      continue;
    }

    let fileContent = fs.readFileSync(argv[i]).toString();

    if (regExp !== null) {
      const result = fileContent.matchAll(regExp);

      let shift = 0;
      for (const element of result) {
        const beforeResult = element.index + shift;

        fileContent = `${fileContent.slice(
          0,
          beforeResult
        )}${colorRegExpResult}${fileContent.slice(
          beforeResult,
          fileContent.length
        )}`;

        shift += colorRegExpResult.length;
        const afterResult = element.index + element.toString().length + shift;

        fileContent = `${fileContent.slice(
          0,
          afterResult
        )}${contentColor}${fileContent.slice(afterResult, fileContent.length)}`;

        shift += contentColor.length;
      }
    }

    console.log(`${headerColor}${argv[i]}\n\n${contentColor}${fileContent}`);

    if (flagAwait && i < argv.length - 1) {
      await new Promise((res, rej) => {
        process.stdin.resume();
        process.stdin.once('data', () => {
          res();
          process.stdin.pause();
        });
      });
    }
  }
})();
