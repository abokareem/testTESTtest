const mongoose = require('mongoose')


const EvoucherSchema = new mongoose.Schema({

    createdAt:{
        type:Date,
        default:Date.now()
    },
    token:{
        type:String,
        required:true
    },
    wallet:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'wallet'
    },
    value:{
        type:Number,
        required:true
    },
    active:{
        type:Boolean,
        default:true
    }
});


module.exports = mongoose.model('evoucher',EvoucherSchema)