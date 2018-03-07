import Config from 'webpack-config';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import path from 'path';

export default new Config().merge({
    entry: path.resolve(__dirname, '../src/client', 'index.js'),
    output: {
        path: path.join(__dirname, '../public'),
        filename: 'bundle.js',
        publicPath: '/',
    },
    resolve: {
        extensions: ['.js', '.jsx'],
    },
    module: {
        rules: [
            {
                test: /\.jsx/,
                use: {
                    loader: 'babel-loader',
                    options: {presets: ['react', 'es2015', 'stage-2', 'babel-polyfill']}
                },
                exclude: /node_modules/
            },
            {
                test: /\.js$/,
                use: {
                    loader: 'babel-loader',
                    options: {presets: ['react', 'es2015', 'stage-2', 'babel-polyfill']}
                },
                exclude: /node_modules/
            },
            {
                test: /\.css|\.scss/,
                use: ['style-loader', 'css-loader', 'sass-loader']
            },
            {
                test: /\.woff($|\?)|\.woff2($|\?)|\.ttf($|\?)|\.eot($|\?)|\.svg($|\?)/,
                loader: 'url-loader'
            },
            {
                test: /\.(?:png|jpg|jpeg|JPEG|gif|svg)$/,
                loader: 'file-loader',
                query: {
                    // Inline images smaller than 10kb as data URIs        limit: 10000
                }
            }
        ]
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: 'src/client/index.html',
            inject: "body"
        })]
});