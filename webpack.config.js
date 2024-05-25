const path = require('path');

module.exports = {
    entry: './postcodes/static_src/index.ts',
    output: {
        'path': path.resolve(__dirname, 'postcodes/static/postcodes/js/'),
        'filename': 'postcodes.js'
    },
    resolve: {
        extensions: ['.ts', '...'],
    },
    mode: 'production',
    module: {
        rules: [
            {
                test: /\.ts$/i,
                use: 'ts-loader',
                exclude: '/node_modules/'
            }
        ]
    }
}