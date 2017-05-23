var path = require('path');
module.exports = {
    entry: {
        app: ['./src/evolvingImages/evolving.images.ts']
    },
    module: {
        rules: [{
            test: /\.ts$/,
            use: [
                {
                    loader: 'awesome-typescript-loader'
                }
            ]
        }]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    output: {
        path: path.resolve(__dirname, 'build'),
        filename: 'evolving.images.bundle.js'
    }
};