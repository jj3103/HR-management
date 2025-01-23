//backend\middlewares\upload.js
const multer = require('multer');
const path = require('path');

// Define storage for the photos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder to save uploaded files
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext); // Create a unique filename
  }
});

// Create an upload instance
const upload = multer({ storage: storage });

module.exports = upload;
