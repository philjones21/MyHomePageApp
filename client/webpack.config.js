const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {

    entry: "./src/code/main.tsx",

    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },

    module: {
        rules: [
            {
                test: /\.html$/,
                use: { loader: "html-loader" }
            },
            {
                test: /\.css$/,
                use: ["style-loader", "css-loader"]
            },
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader'
            },
            {
                test: /\.(png|jpg|jpeg|gif)$/,
                loader: 'file-loader'
            },
            //{
            //    test: /\.svg$/i,
            //   loader: 'url-loader',   
            //},
            {
                test: /\.svg/,
                use: {
                    loader: "svg-url-loader",
                    options: {
                        // make all svg images to work in IE
                        iesafe: true,
                    },
                },
            },
            /*{
                test: /\.m?js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: ['@babel/plugin-proposal-object-rest-spread']
                    }
                }
            },*/
        ]

    },

    plugins: [
        new HtmlWebPackPlugin({ template: "./src/index.html", filename: "./index.html" })
    ],

    performance: { hints: false },
    watch: true,
    devtool: "source-map",
    mode: "development",
    target: ['web', 'es5']

};