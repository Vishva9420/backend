const {VideoUpload } = require('./videoUploadModel');
const {User } = require('./user.model');
const {guser } = require('./guser.model');
const {comments} = require('./comments.model');
const {history} = require('./history.model');

module.exports= {
    VideoUpload,
    User,
    guser,
    comments,
    history
  
}