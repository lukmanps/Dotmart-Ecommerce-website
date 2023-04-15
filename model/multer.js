const multer = require('multer');

module.exports = {

    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/db/product-images');
        },

        filename: (req, file, cb) => {
            console.log(file);
            let uniqueFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
            cb(null, uniqueFileName);
        }

        // Math.round(Math.random() * 1E9
    }),

    bannerStorage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, './public/db/banner-images');
        },
    
        filename: (req, file, cb) => {
            console.log(file);
            let uniqueFileName = Date.now() + '-' + Math.round(Math.random() * 1E9) + '.jpg';
            cb(null, uniqueFileName);
        }
    })
}

