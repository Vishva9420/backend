const mongoose = require('mongoose');

const VideoUploadSchema= new mongoose.Schema({
    title:{
        type: String,
       
        trim: true
    },
    genere:{
        type: String,
       
    },
    description:{
        type: String,
        
    },
    url:{
        type:String
    },
    uid:{
        type:String
    },
    spamCount:{
        type:Number
    },
    views:{
        type:Number
    },
    
})

const VideoUpload = mongoose.model('VideoUpload', VideoUploadSchema);
module.exports= {VideoUpload}