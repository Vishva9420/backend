const mongoose = require('mongoose');

const signUpSchema= new mongoose.Schema({
    uname:{
        type: String,
       
        trim: true
    },
    email:{
        type: String,
       
    },
    fname:{
        type: String,
        
    },
    lname:{
        type:String
    },
    address:{
        type:String
    },
    city:{
        type:String
    },
    country:{
        type:String
    },
    pcode:{
        type:String
    },
    url:{
        type:String
    }
})

const signUp = mongoose.model('signUp', signUpSchema);
module.exports= {signUp}