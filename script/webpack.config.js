const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, '../index.js'),
    output: {
        filename: 'index.js',
        path: path.resolve(__dirname, '../dist'),
        libraryTarget: 'umd',
        library: 'firstScreenTime'
    },
    mode: process.env.NODE_ENV,
    devServer: {
      inline: true,
      hot: true,
    }
};