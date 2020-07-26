const MessagingResponse = require('twilio').twiml.MessagingResponse;
const {
    createWallet,getWalletByPhone,changePinByPhone,
    generateEvoucherByPhone,depositEvoucherByPhone,
    sendMoneyByPhone,getTransactionsHistory,createMarchantAccount,
    payMerchant,deactivateWallet,confirmTransaction
} = require('../utils/wallet')

const twilio = require('twilio')

const axios = require('axios');


const ERR_MSG = 'حدث خطأ ما , برجاء التأكد من أوامر المحفظة بشكل صحيح , والمحاولة من جديد'

module.exports= {
    smsBot:async(req,res,next)=>{
        const twiml = new MessagingResponse();

        const userMsg = req.body.Body.toLowerCase().split(/\s+/);

        const cmd = userMsg[0]

        const phone = req.body.From;

        if(cmd === 'reg'){
            
            try {
                const resp = await createWallet(req.body.From,userMsg[1])

                if(resp.error){

                    // twiml.message(resp.message);


                    sendMsg(phone,resp.message)

    
                }else{
                    // twiml.message(`لقد تم إنشاء محفظتك بنجاح!
                    //  المفتاح الخاص بك : ${resp.wallet.privateKey}
                    // يرجي حفظ معلومات حسابك بأمان
                    // pin : ${userMsg[1]}
                    // `)

                    let message = `الرقم السري: ${userMsg[1]}  \n المفتاح الخاص: ${resp.wallet.privateKey}  \n يرجي حفظهم بأمان.`

                   sendMsg(phone,message)

                }
    
                
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
                }
    

        }else if(cmd === 'b'){
           
            try {

                const resp = await getWalletByPhone(req.body.From,userMsg[1])

                // twiml.message(resp.message)
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

               sendMsg(phone,resp.message)
                
            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
            }

        }else if(cmd === 'c'){

            try {

                const resp = await changePinByPhone(req.body.From,userMsg[1],userMsg[2])


               // twiml.message(resp.message)
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

               sendMsg(phone,resp.message)
                
            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
            }

        }else if(cmd === 'w'){

            try {

                const resp = await generateEvoucherByPhone(req.body.From,userMsg[2],userMsg[1])

                // twiml.message(resp.message)
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

               sendMsg(phone,resp.message)
                
            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
            }

        }else if(cmd === 'd'){

            try {

                const resp = await depositEvoucherByPhone(req.body.From,userMsg[1])

               // twiml.message(resp.message)
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

               sendMsg(phone,resp.message)
                
            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
            }

        }else if(cmd === 'send'){

            try {
                
                const resp = await sendMoneyByPhone(req.body.From,userMsg[3],userMsg[2],userMsg[1])

               // twiml.message(resp.message)
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

               sendMsg(phone,resp.message)
                
            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
            }

        }else if(cmd === 't'){

            try {

                const resp = await getTransactionsHistory(req.body.From,userMsg[1])

                // twiml.message(resp.message)
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,resp.message)
                
            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
            }

        }else if(cmd === 'regm'){

            try {

                merchantName = req.body.Body.split(/\s+/)[1];

                const resp = await createMarchantAccount(req.body.From,merchantName,userMsg[2])

               // twiml.message(resp.message)
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

               sendMsg(phone,resp.message)
                
            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
            }
        }else if(cmd === 'pay'){

            try {

                const resp = await payMerchant(req.body.From,userMsg[3],userMsg[2],userMsg[1])

                // twiml.message(resp.message)
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

               sendMsg(phone,resp.message)
                
            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
            }

        }else if(cmd === 'da'){

            try {

                const resp = await deactivateWallet(userMsg[1])

                // twiml.message(resp.message)
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

               sendMsg(phone,resp.message)
                
            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
            }

        }else if(cmd === 'v'){

            try {

                const resp = await confirmTransaction(req.body.From,userMsg[1])

               // twiml.message(resp.message)
    
                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

               sendMsg(phone,resp.message)
                
            } catch (error) {
                
                // twiml.message(ERR_MSG)
                console.log(error)

                // res.writeHead(200, {'Content-Type': 'text/xml'});
                // res.end(twiml.toString());

                sendMsg(phone,ERR_MSG)
            }

        }else if(cmd === '/hebvvvvvvvlp'){

            // twiml.message(`
            //     create Wallet : reg [Your new pin]
            //     send money : send [reciver phone] [amount] [pin]
            //     check balance : b [pin]
            //     generate E-voucher : w [amount] [pin]
            //     deposit E-voucher: d [e-voucher]
            //     change Pin : c [old pin] [new pin]
            //     create merchant wallet : regm [merchant*name] [pin]
            //     pay merchant : pay [merchant number] [amount] [pin]
            //     deactivate wallet : da [private Key]
            //     transactions history : t [pin]
            // `);

            // res.writeHead(200, {'Content-Type': 'text/xml'});
            // res.end(twiml.toString());
            let message = `
            create Wallet : reg [Your new pin]
            send money : send [reciver phone] [amount] [pin]
            check balance : b [pin]
            generate E-voucher : w [amount] [pin]
            deposit E-voucher: d [e-voucher]
            change Pin : c [old pin] [new pin]
            create merchant wallet : regm [merchant*name] [pin]
            pay merchant : pay [merchant number] [amount] [pin]
            deactivate wallet : da [private Key]
            transactions history : t [pin]
        `

        sendMsg(phone,message)
        
        }else{

            // twiml.message('أمر غير معروف: أكتب /hebvvvvvvvlp  لعرض الأوامر');

            // res.writeHead(200, {'Content-Type': 'text/xml'});
            // res.end(twiml.toString());

            let message = 'أمر غير معروف: أكتب /hebvvvvvvvlp  لعرض الأوامر';

           sendMsg(phone,message)
        }
    }
}


const sendMsg = (phone,message)=>{

    let emsg = encodeURIComponent(message)

    axios.get(`http://www.tweetsms.ps/api.php?comm=sendsms&user=CoreMax&pass=palman00$$&to=${phone.replace('+','')}&message=${emsg}&sender=Dinar%20Pay `).then(res=>{
                        console.log(res.data)
                    })
}
