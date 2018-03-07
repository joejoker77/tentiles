import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
const bodyParser    = require('body-parser');
const PORT          = 7700;
const PUBLIC_PATH   = __dirname + '/public';
const app           = express();
const isDevelopment = process.env.NODE_ENV === 'development';
if (isDevelopment) {
    const webpack       = require('webpack');
    const webpackConfig = require('./webpack.config.babel').default;
    const compiler      = webpack(webpackConfig);
    app.use(require('webpack-dev-middleware')(compiler, {
        hot: true,
        stats: {
            colors: true
        }
    }));
    app.use(require('webpack-hot-middleware')(compiler));
} else {
    app.use(express.static(PUBLIC_PATH));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());
app.post('/upload', function(req, res) {
    if (!req.files){
        return res.status(400).send('No files were uploaded.');
    }
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.file;
    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv('/home/haligali/Projects/Web/tshirt.loc/src/server/tiles_data/' + req.body.index_tile + '/imageObject.jpg', function(err) {
        if (err)
            return res.status(500).send(err);
        res.send('File uploaded!');
    });
});
app.all("*", function(req, res) {
    res.sendFile(path.resolve(PUBLIC_PATH, 'index.html'));
});
app.listen(PORT, function() {
    console.log('Listening on port ' + PORT + '...');
});