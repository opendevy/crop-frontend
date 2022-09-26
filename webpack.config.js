const path = require('path');

module.exports = {
  output: {
    filename: 'my-first-webpack.bundle.js',
  },
  module: {
    // rules: [{ test: /\.txt$/, use: 'raw-loader' }],
    rules : [{
    /*test: /\.extension$/,*/
    test: /\.mjs$/,
    include: /node_modules/,
    type: 'javascript/auto'
}]
  },
};