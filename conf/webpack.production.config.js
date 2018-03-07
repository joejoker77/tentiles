import Config from 'webpack-config';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin';

export default new Config().extend('./conf/webpack.base.config.js').merge({
    output: {
        filename: 'bundle.min.js'
    },
    plugins: [
        new UglifyJsPlugin()
    ]
});