const mongoose = require('mongoose');
const app = require('./app');
require('dotenv').config();

const port = process.env.PORT || 8000;
mongoose.connect(process.env.DB_URI || 'mongodb://admin:admin211@ds163182.mlab.com:63182/walletapp', {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
});
mongoose.set('useCreateIndex', true);
mongoose.connection.on('error', (error) => {
    // eslint-disable-next-line no-console
    console.log(error);
    process.exit(1);
});

app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Listing on port ${port}`);
}).on('error', (e) => {
    // eslint-disable-next-line no-console
    console.error(e);
    process.exit(1);
});
