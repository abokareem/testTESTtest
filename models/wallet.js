const mongoose = require('mongoose')
const cryptoRandomString = require('crypto-random-string');

const WalletSchema = new mongoose.Schema({
    privateKey:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true
    },
    evouchers:{
        type:[mongoose.Schema.Types.ObjectId]
    },
    balance:{
        type:Number,
        default:0
    },
    transactions:{
        type:[mongoose.Schema.Types.ObjectId]
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    pin:{
        type:String,
        required:true
    },
    username:{
        type:String
    },
    isMerchant:{
        type:Boolean,
        default:false
    },
    merchantKey:{
        type:String,
    },
    isActive:{
        type:Boolean,
        default:true,
    }
    
});


module.exports = mongoose.model('wallet',WalletSchema);