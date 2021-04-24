const mongoose = require('mongoose');

const CommentsSchema= new mongoose.Schema({
    comments:{
        type: String
    },
    videoId:{
        type: String
    },
    like:{
        type: Number
    },
    dislike:{
        type: Number
    },
    canLike:{
        type: Number
    },
    canDislike:{
        type: Number
    },
    userId:{
        type: String
    },
    cReply:[{
       userId:String,
       reply:String,
    }],

   
   
   
  
})

const comments = mongoose.model('comments',CommentsSchema);
module.exports= {comments}