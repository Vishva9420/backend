const multer = require('multer');

const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    const mimeType = file.mimetype.split('/');
    const fileType = mimeType[0];
    
    // const fileName = file.originalname;

    const fileName = file.originalname;

    
    cb(null, fileName);
  },
});

// const fileFilter = (req, file, cb) => {
//   const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
//   allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
// };


module.exports =  multer({ storage: diskStorage }).single(
  'image'
);