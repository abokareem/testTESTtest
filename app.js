const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
var twilio = require('twilio');
const http = require('http');

const axios = require('axios');

const {smsBot} = require('./controllers/sms')

const Evoucher = require('./models/evoucher');
const Transaction = require('./models/transaction');

require('dotenv').config()

Evoucher.findOne({token:'superadmin'}).then(res=>{
    if(!res){
        evoucher = Evoucher({
            token:'superadmin',
            value:50,
        })

        evoucher.save();
    }
})


//setup twilio
var accountSid = process.env.TWILIO_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_TOKEN; 

const twilioClient =new twilio(accountSid, authToken);

require('dotenv').config();

const app = express();

app.set('view engine', 'ejs');
app.use(compression());
app.use(helmet());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('common'));

// app.use(express.static(__dirname + '/public'))
// eslint-disable-next-line no-unused-vars


app.post('/sms',smsBot)



// app.use('/', express.static('uploads'));
// app.use('/api', router);

app.get('/transactions',async(req,res)=>{

    transactions = await Transaction.find()
    .populate('from',null,'wallet')
    .populate('to',null,'wallet');

    res.render('./transactions.ejs',{transactions})
})


module.exports = app;
