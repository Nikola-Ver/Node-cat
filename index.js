const fs = require('fs');
const colors = require('./colors');
const argv = process.argv;

let headerColor = colors.FgCyan;
let contentColor = colors.FgWhite;

if (/colors: /gi.exec(argv[argv.length - 1]) !== null) {
  const [newHeaderColor, newContentColor] = argv[argv.length - 1]
    .match(/(?<=colors: ).*/gi)[0]
    .split(' ');

  headerColor = colors[newHeaderColor] || newHeaderColor;
  contentColor = colors[newContentColor] || contentColor;

  argv.pop();
}

let flagAwait = false;

if ('await' === argv[argv.length - 1].toLowerCase()) {
  flagAwait = true;
  argv.pop();
}

(async () => {
  for (let i = 2; i < argv.length; ++i) {
    try {
      if (!fs.statSync(argv[i]).isFile()) continue;
    } catch {
      continue;
    }

    const fileContent = fs.readFileSync(argv[i]);
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
