const fs = require("fs");

const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    //deletes file at his path
    if (err) {
      throw err;
    }
  });
};

exports.deleteFile = deleteFile;