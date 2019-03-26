'use strict'
const { VueLoaderPlugin } = require('vue-loader');

class FileListPlugin {
  constructor(doneCallback, failCallback) {
    this.doneCallback = doneCallback;
    this.failCallback = failCallback;
  }

  apply(compiler) {
    // emit is asynchronous hook, tapping into it using tapAsync, you can use tapPromise/tap(synchronous) as well
    compiler.hooks.emit.tapAsync('FileListPlugin', (compilation, callback) => {
      // Create a header string for the generated file:
      var filelist = 'In this build:\n\n';

      // Loop through all compiled assets,
      // adding a new line item for each filename.
      for (var filename in compilation.assets) {
        filelist += '- ' + filename + '\n';
      }

      // Insert this list into the webpack build as a new file asset:
      compilation.assets['filelist.md'] = {
        source: function() {
          return filelist;
        },
        size: function() {
          return filelist.length;
        }
      };

      callback();
    });
    // console.log(JSON.stringify(compiler.hooks))
    // console.log((compiler.hooks))
    compiler.hooks.afterPlugins.tap('FileListPlugin', (compilation) => {
      // Create a header string for the generated file:
      console.log("after plugins")
      // callback();
    });

    compiler.hooks.done.tap('EndWebpackPlugin', (stats) => {
      this.doneCallback(stats);
    });
    compiler.hooks.failed.tap('EndWebpackPlugin', (err) => {
      this.failCallback(err);
    });
  }
}

let config = {
  mode: 'development',
  entry: [
    './src/app.js'
  ],
  module: {
    rules: [
      {
        test: /\.vue$/,
        use: 'vue-loader'
      },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          loader: "eslint-loader",
          options: {
            emitWarning: true
            // eslint options (if necessary)
          }
        }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
    new FileListPlugin((stats) => {
      console.log("finished Success--------")
    },
    (err) => {
      console.log("finished Error--------",err)
    }),
  ]
}

module.exports = config