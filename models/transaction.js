const mongoose = require('mongoose');
const cryptoRandomString = require('crypto-random-string');

const TransactionSchema = new mongoose.Schema({
    createdAt:{
        type:Date,
        default:Date.now()
    },
    from:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'wallet'
    },
    to:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'wallet'
    },
    complete:{
        type:Boolean,
        default:false
    },
    otp:{
        type:String
    },
    status:{
        type:String
    },
    desc:{
        type:String
    },
    value:{
        type:Number
    },
    id:{
        type:String,
        default:cryptoRandomString({length:12,type:'distinguishable'})
    }
});

module.exports = mongoose.model('Transaction',TransactionSchema)