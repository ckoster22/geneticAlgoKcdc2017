var path = require("path");
module.exports = {
    entry: {
        app: ["./src/evolvingImages/evolving.images.js"]
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                loader: 'babel-loader'
            }]
        }]
    },
    resolve: {
        extensions: ['.js']
    },
    output: {
        path: path.resolve(__dirname, "build"),
        filename: "evolving.images.bundle.js"
    }
};