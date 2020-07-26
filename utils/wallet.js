const _ = require('lodash');
const cryptoRandomString = require('crypto-random-string');
const validator = require('validator');
const {hashSync,compareSync} = require('bcryptjs')
const moment = require('moment');

//models 
const Evoucher = require('../models/evoucher')
const Transaction = require('../models/transaction');
const Wallet = require('../models/wallet')

const axios = require('axios');

require('dotenv').config()



//desc 
const GEN_EVOUCHER = "سحب قسيمة"
const D_EVOUCHER = "إيداع قسيمة"
const R_MONEY = "إيداع"
const S_MONEY = "إرسال"
const S_MERCHANT = 'دفع'
const R_MERCHANT = 'تحصيل دفع'

//api functions
module.exports = {
    createWallet:async(phone,pin)=>{

        if(!phone){
            return {
                error:true,
                message:'phone is required'
            }
        }

        if(await Wallet.findOne({phone})){
            return {
                error:true,
                message:"الحساب مسجل مسبقاً"
            }
        }

        if(!pin || pin.length < 4  || pin.length > 4 || !validator.isNumeric(pin)){
            return {
                error:true,
                message:'الرقم السري PIN يجب أن يتكون من 4 ارقام فقط. مثال 1234'
            }
        }

        privateKey = cryptoRandomString({length: 10, type: 'distinguishable'})

        while(await Wallet.findOne({privateKey})){
            privateKey = cryptoRandomString({length: 10, type: 'distinguishable'})
        }

        const hashPin = hashSync(pin,10)
        
        let wallet = Wallet({
            phone,
            privateKey,
            pin:hashPin
        })

        try {
            await wallet.save()

            return {
                error:false,
                message:'تم إنشاء المحفظة بنجاح',
                wallet
            }
        } catch (error) {

            console.log(error)
            
            return {
                error:true,
                message:'an error happened please try again',
                error
            }

        }
    },
    getWalletByPhone:async(phone,pin)=>{

        const wallet = await Wallet.findOne({phone})

        if(!wallet){
            return {
                error:true,
                message:"الحساب غير مسجل!"
            }
        }

        if(!compareSync(pin,wallet.pin)){
            return {
                error:true,
                message:'الرقم السري غير صحيح'
            }
        }

        if(!wallet.isActive){
            return {
                error:true,
                message:"الحساب معطل"
            }
        }

        return {
            error:false,
            message:`رصيد حسابك هو :  ${wallet.balance} شيكل`
        }
    },
    changePinByPhone:async(phone,oldPin,newPin)=>{

        const wallet = await Wallet.findOne({phone});

        if(!wallet){
            return {
                error:true,
                message:"الحساب غير مسجل!"
            }
        }

        if(!compareSync(oldPin,wallet.pin)){
            return {
                error:true,
                message:'الرقم السري غير صحيح'
            }
        }

        if(!wallet.isActive){
            return {
                error:true,
                message:"الحساب معطل"
            }
        }

        if(!newPin || newPin.length < 4  || newPin.length > 4 || !validator.isNumeric(newPin)){
            return {
                error:true,
                message:'الرقم السري PIN يجب أن يتكون من 4 ارقام فقط. مثال 1234'
            }
        }


        wallet.pin = hashSync(newPin,10)

        await wallet.save()

        return {
            error:false,
            message:'تم تغيير الرقم السري , بنجاح'
        }
    },
    generateEvoucherByPhone:async(phone,pin,value)=>{

        const wallet = await Wallet.findOne({phone});

        if(!wallet){
            return {
                error:true,
                message:"الحساب غير مسجل"
            }
        }

        if(!compareSync(pin,wallet.pin)){
            return {
                error:true,
                message:'الرقم السري غير صحيح'
            }
        }

        if(!wallet.isActive){
            return {
                error:true,
                message:"الحساب معطل"
            }
        }

        if(value < 2){
            return {
                error:true,
                message:'الحد الأدني لإنشاء قسيمة نقدية هي: 2 شيكل'
            }
        }

        if(wallet.balance < value){

            return {
                error:true,
                message:`رصيدك غير كافي, \n  الرصيد الحالي: ${wallet.balance.toFixed(2)} ش`,
            }
        }

        //evoucher tokens parts
        tokenP1 = cryptoRandomString({length: 3, type: 'distinguishable'})
        tokenP2 = cryptoRandomString({length: 3, type: 'distinguishable'})
        tokenP3 = cryptoRandomString({length: 3, type: 'distinguishable'})
        tokenP4 = cryptoRandomString({length: 3, type: 'distinguishable'})

        token = `${tokenP1}-${tokenP2}-${tokenP3}-${tokenP4}`

        while(await Evoucher.findOne({token})){
            //evoucher tokens parts
            tokenP1 = cryptoRandomString({length: 3, type: 'distinguishable'})
            tokenP2 = cryptoRandomString({length: 3, type: 'distinguishable'})
            tokenP3 = cryptoRandomString({length: 3, type: 'distinguishable'})
            tokenP4 = cryptoRandomString({length: 3, type: 'distinguishable'})

            token = `${tokenP1}-${tokenP2}-${tokenP3}-${tokenP4}`
        }
            
        const evoucher = Evoucher({
            token,
            value,
            wallet:wallet._id
        })

        await evoucher.save()

        wallet.balance -= value;
        wallet.evouchers = [...wallet.evouchers,evoucher._id]


        await wallet.save()

        
        const transaction = await createTransaction(wallet,value,GEN_EVOUCHER)

        wallet.transactions = [...wallet.transactions,transaction._id]

        await wallet.save()

        return {
            error:false,
            message:`سحب عبر قسيمة نقدية \n رقم القسيمة: ${evoucher.token} \n المبلغ ${evoucher.value} شيكل \n رصيد حسابك ${wallet.balance.toFixed(2)} شيكل`
        }

        

    },

    depositEvoucherByPhone:async(phone,token)=>{

        const wallet = await Wallet.findOne({phone});

        if(!wallet){
            return {
                error:true,
                message:"أنت غير مسجل"
            }
        }

        if(!wallet.isActive){
            return {
                error:true,
                message:"الحساب معطل"
            }
        }


        const evoucher = await Evoucher.findOne({token:token.toUpperCase()})

        if(!evoucher){
            return {
                error:true,
                message:'رقم القسيمة النقدية غير صحيح  , برجاء التأكد و المحاولة مرة أخري'
            }
        }

        if(!evoucher.active){
            return {
                error:true,
                message:'رقم القسيمة النقدية , مستخدم مسبقاً'
            }
        }


        wallet.balance += evoucher.value;

        await wallet.save()

        evoucher.active = false;

        await evoucher.save();

        const transaction = await createTransaction(wallet,evoucher.value,D_EVOUCHER)

        wallet.transactions = [...wallet.transactions,transaction._id]

        await wallet.save()

        
          return {
              error:false,
              message:`إيداع عبر قسيمة \n بمبلغ ${evoucher.value} شيكل \n رصيد حسابك ${wallet.balance.toFixed(2)} شيكل`
              
          }

    },
    
    sendMoneyByPhone:async(phone,pin,recvPhone,amount)=>{

        const wallet = await Wallet.findOne({phone});

        if(!wallet){
            return {
                error:true,
                message:"الحساب غير مسجل"
            }
        }

        if(!compareSync(pin,wallet.pin)){
            return {
                error:true,
                message:'الرقم السري غير صحيح'
            }
        }

        if(!wallet.isActive){
            return {
                error:true,
                message:"الحساب معطل"
            }
        }

        if(amount < 1){
            return {
                error:true,
                message:'عذراً , الحد الأدني لإرسال الأموال هي: 1 شيكل'
            }
        }

        const recvWallet = await Wallet.findOne({phone:recvPhone.replace('0','+972')})


        if(!recvWallet){
            return {
                error:true,
                message:"رقم المستلم غير مسجل لدينا برجاء التأكد و المحاولة مرة أخري"
            }
        }

        if(wallet.balance < amount){

            return {
                error:true,
                message:`عذراً ,رصيدك غير كافي \n رصيد حسابك: ${wallet.balance.toFixed(2)} شيكل`,

            }
        }


        let id = cryptoRandomString({length:12})

        while(await Transaction.findOne({id})){
            id = cryptoRandomString({length:12})
        }

        const otp = cryptoRandomString({length:6,type:'numeric'});

        transaction = Transaction({
            from:wallet._id,
            to:recvWallet._id,
            value:amount,
            complete:false,
            desc:S_MONEY,
            id,
            otp
        })

        await transaction.save()

        wallet.transactions = [...wallet.transactions,transaction._id]

        await wallet.save()

        return {
            error:false,
            message:`إرسال ${amount} ش إلى: ${recvPhone.replace('+972','0')}\nلاتمام العملية أرسل رمز التأكيد: \n V ${otp}`
        }

        

    },

    getTransactionsHistory:async(phone,pin)=>{

        const wallet = await Wallet.findOne({phone}).populate('transactions',null,'Transaction');

        if(!wallet){
            return {
                error:true,
                message:"الحساب غير مسجل"
            }
        }

        if(!compareSync(pin,wallet.pin)){
            return {
                error:true,
                message:'الرقم السري غير صحيح'
            }
        }

        if(!wallet.isActive){
            return {
                error:true,
                message:"الحساب معطل"
            }
        }

        let message = '';

        wallet.transactions.reverse().slice(0,3).forEach(item=>{


            if(item.to){
                if((item.to.toString() == wallet._id.toString()) && item.desc == S_MONEY){
                    item.desc = R_MONEY
                }
    
                if((item.to.toString() == wallet._id.toString()) && item.desc == S_MERCHANT){
                    item.desc = R_MERCHANT
                }
            }

            message += `${moment(item.createdAt).format('YY/MM/DD')} ${item.desc} ${item.value} ش \n`
        })

        return {
            error:false,
            message
        }

    },
    createMarchantAccount:async(phone,name,pin)=>{

        const wallet = await Wallet.findOne({phone});

        if(wallet){
            return {
                error:true,
                message:"الحساب مسجل مسبقاً"
            }
        }

        let privateKey = cryptoRandomString({length: 10, type: 'distinguishable'})

        while(await Wallet.findOne({privateKey})){
            privateKey = cryptoRandomString({length: 10, type: 'distinguishable'})
        }

        let merchantKey = cryptoRandomString({length:6,type:'numeric'})

        while(await Wallet.findOne({merchantKey})){
            merchantKey = cryptoRandomString({length:6,type:'numeric'})
        }

        let spacedName = name.split('*').join(' ')

        const newWallet =  Wallet({
            phone,
            username:spacedName,
            pin:hashSync(pin,10),
            isMerchant:true,
            privateKey,
            merchantKey
        });

        await newWallet.save()

        return {
            error:false,
            message:`تم التسجيل \n إسم التاجر: ${newWallet.username} \n رقم الحساب: ${newWallet.merchantKey} \n الرقم السري: ${pin} \n المفتاح الخاص: ${newWallet.privateKey} \n يرجي حفظ معلومات حسابك بأمان.`
        }


    },

    payMerchant:async(phone,pin,merchantKey,amount)=>{

        const wallet = await Wallet.findOne({phone});

        if(!wallet){
            return {
                error:true,
                message:"الحساب غير مسجل"
            }
        }

        if(!compareSync(pin,wallet.pin)){
            return {
                error:true,
                message:'الرقم السري غير صحيح'
            }
        }

        if(!wallet.isActive){
            return {
                error:true,
                message:"الحساب معطل"
            }
        }

        if(amount < 1){
            return {
                error:true,
                message:'عذراً , الحد الأدني لإرسال الأموال هي: 1 شيكل'
            }
        }

        const merchantWallet = await Wallet.findOne({merchantKey});

        if(!merchantWallet){
            return {
                error:true,
                message:"رقم حساب التاجر غير صحيح"
            }
        }

        
        if(wallet.balance < amount){
            return {
                error:true,
                message:`عذراً  ,رصيدك غير كافي  \n رصيد حسابك: ${wallet.balance.toFixed(2)} شيكل`
            }
        }

        wallet.balance -= parseFloat(amount);
        merchantWallet.balance += parseFloat(amount);

        await wallet.save();
        await merchantWallet.save();

        let id = cryptoRandomString({length:12})

        while(await Transaction.findOne({id})){
            id = cryptoRandomString({length:12})
        }

        const transaction = Transaction({
            from:wallet._id,
            to:merchantWallet._id,
            value:amount,
            complete:true,
            desc:S_MERCHANT,
            id
        })

        await transaction.save()

        wallet.transactions = [...wallet.transactions,transaction._id];
        merchantWallet.transactions = [...merchantWallet.transactions,transaction._id];

        await wallet.save()
        await merchantWallet.save();

        let notify = `تحصيل دفع ${amount} ش من${phone.replace('+972','0')} \n الرصيد ${parseFloat(merchantWallet.balance) - parseFloat(amount)} شيكل \n الرصيد الجديد ${merchantWallet.balance} شيكل`

        notify = encodeURIComponent(notify)

        setTimeout(()=>axios.get(`http://www.tweetsms.ps/api.php?comm=sendsms&user=CoreMax&pass=palman00$$&to=${merchantWallet.phone.replace('+','')}&message=${notify}&sender=Dinar%20Pay`).then(res=>{
            console.log(res.data)
        }),2000)

        return {
            error:false,
            message:`دفع ${amount} ش إلى: ${merchantWallet.username} \n رصيد حسابك ${wallet.balance.toFixed(2)} شيكل`
        }
    },

    deactivateWallet:async(privateKey)=>{

        const wallet = await Wallet.findOne({privateKey:privateKey.toUpperCase()})

        if(!wallet){

            return {
                error:true,
                message:'المفتاح الخاص بك , غير صحيح'
            }
        }

        wallet.isActive = false;

        await wallet.save();

        return {
            error:false,
            message:'تم تعطيل المحفظة بنجاح'
        }
    },

    confirmTransaction:async(phone,otp)=>{

        const wallet = await Wallet.findOne({phone});

        if(!wallet){
            return {
                error:true,
                message:"الحساب غير مسجل"
            }
        }

        const transaction = await Transaction.findOne({from:wallet._id,otp})

        if(!transaction){

            return {
                error:true,
                message:'رمز التأكيد غير صحيح'
            }
        }

        const transactionTime = moment(transaction.createdAt)
        const now = moment(new Date())

        if(moment.duration(now.diff(transactionTime)).asHours > 1){
            
            return {
                error:true,
                message:'إنتهت 60 دقيقة مدة صلاحية "رمز التأكيد" يجب عليك إعادة المعاملة'
            }
        }

        let amount = transaction.value;

        const recvWallet = await Wallet.findOne({_id:transaction.to})

        wallet.balance -= amount;
        recvWallet.balance += amount;

        recvWallet.transactions = [...recvWallet.transactions,transaction._id]

        await recvWallet.save();
        await wallet.save();

        transaction.complete = true;
        transaction.otp = '';
        
        await transaction.save();

    //     const notify = `تم تحويل مبلغ: ${amount} الى: ${recvWallet.phone}`

    //     axios.get(`http://www.hotsms.ps/sendbulksms.php?user_name=test&user_pass=3006669&sender=test%20&mobile=${phone.replace('+','')}&type=2&text=${notify} `).then(res=>{
    // console.log(res.data)
// })

        let recvNotify = `إستلام ${amount} ش من: ${phone.replace('+972','0')} \nرصيد حسابك ${recvWallet.balance.toFixed(2)} شيكل`

        recvNotify = encodeURIComponent(recvNotify)

        setTimeout(()=>axios.get(`http://www.tweetsms.ps/api.php?comm=sendsms&user=CoreMax&pass=palman00$$&to=${recvWallet.phone.replace('+','')}&message=${recvNotify}&sender=Dinar%20Pay`).then(res=>{
            console.log(res.data)
        }),2000)

        return {
            error:false,
            message:`تم إرسال ${amount} ش إلى: ${recvWallet.phone.replace('+972','0')} \n رصيد حسابك ${wallet.balance.toFixed(2)} شيكل`
        }



    }


}

const createTransaction = async (wallet,value,desc,to=null)=>{

    let id = cryptoRandomString({length:12})

    while(await Transaction.findOne({id})){
        id = cryptoRandomString({length:12})
    }

    transaction = Transaction({
        from:wallet._id,
        to,
        value,
        complete:true,
        desc,
        id
    })

    await transaction.save()

    return transaction;
}
