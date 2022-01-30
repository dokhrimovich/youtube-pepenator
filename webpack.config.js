const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
    mode: 'production',
    entry: './src/index.js',
    output: {
        filename: 'content.js',
        path: path.resolve(__dirname, 'dist'),
    },
    optimization: {
        minimize: false,
    },
    plugins: [
        new CopyWebpackPlugin(
            [
                {
                    context: 'src/assets/',
                    from: '**/*',
                    to: ''
                }
            ],
            { copyUnmodified: true }
        )
    ]
};
