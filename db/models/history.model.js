const mongoose = require('mongoose');

const HistorySchema= new mongoose.Schema({
    uid:{
        type: String,
       
    },
    title:{
        type: String,
       
    },
    vid:{
        type: String,
       
    },
    genere:{
        type: String,
        
    },
    timestamp:{
        type:String
    }
    
    
})

const history = mongoose.model('history', HistorySchema);
module.exports= {history}