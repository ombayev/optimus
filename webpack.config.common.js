var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/main.ts',
  resolve: {
    extensions: ['.js', '.ts']
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        loaders: ['html-loader']
      },
      {
        test: /\.css$/,
        loaders: ['raw-loader']
      }
    ],
    exprContextCritical: false
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: 'src/index.aspx'
    })
  ]
};
