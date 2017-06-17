const path = require('path');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
  entry: {
    main: ['./ts/Main.ts', './scss/main.scss'],
    viewer: ['./ts/Viewer.ts', './scss/viewer.scss']
  },
  output: {
    filename: '[name].js',
    path: __dirname
  },
  target: "web",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(sass|scss)$/,
        loader: ExtractTextPlugin.extract(['css-loader', 'sass-loader'])
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin({ // define where to save the file
      filename: '[name].bundle.css',
      allChunks: true,
    }),
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".scss"],
    alias: {
      'three-extras': path.resolve(__dirname, './node_modules/three/examples/js/')
    }
  },
  externals: {
    'three': 'three'
  },
  watch: true
};
