const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const config = {
    entry: [
        path.resolve(__dirname, 'src', 'index.js'),
        path.resolve(__dirname, 'src', 'index.scss')
    ],
    output: {
        path: path.join(__dirname, 'dist'),
        filename: '[name].js',
        clean: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                use: ['babel-loader'],
                exclude: /node_modules/,
            },
            {
                test: /\.s?[ac]ss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                    {
                        loader: 'css-loader',
                        options: { url: false }
                    },
                    'sass-loader',
                ]
            },
            {
                test: /\.(tff|woff2|)$/,
                type: 'asset/inline'
            }
        ],
    },
    resolve: {
        fallback: {
            fs: false,
            path: false,
            crypto: false
        }
    },
    plugins: [
        new MiniCssExtractPlugin(),
        new CopyPlugin({
            patterns: [
                { from: "./node_modules/sql.js/dist/sql-wasm.wasm", to: "./" },
            ],
        }),
    ],
    experiments: {
        futureDefaults: true
    }
};

module.exports = (env, argv) => {
    if (argv.mode === 'production') {
        config.devtool = 'source-map';
    } else {
        config.devtool = 'eval-source-map';
    }

    return config;
}