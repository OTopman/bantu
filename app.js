const express = require('express');
const BantuBlockchain = require('./BantuBlockchain');
const bantuBlockchain = new BantuBlockchain();
const app = express();


app.use(express.urlencoded({
    extended: false
}));
app.use(express.json({
    limit: '10kb'
}));

app.get('/create', (req, res, next) => {
    const pair = bantuBlockchain.createWallet();
    // console.log(pair);
    return res.status(200).json({
        ...pair
    });
});

app.post('/activate', async (req, res, next) => {
    const {
        accountPubKey
    } = req.body;

    const resp = await bantuBlockchain.activateWallet(accountPubKey)
    // console.log(resp);
    res.status(200).json({
        ...resp
    });
});

app.post('/balance', async (req, res, next) => {
    const {
        accountPubKey
    } = req.body;

    const resp = await bantuBlockchain.walletBalance(accountPubKey);
    console.log(resp);
    return res.status(200).json({
        ...resp
    });
});


app.post('/history', async (req, res, next) => {
    const {
        accountPubKey
    } = req.body;

    const resp = await bantuBlockchain.fetchHistory(accountPubKey);
    console.log(resp);
    return res.status(200).json({
        ...resp
    });
})

app.post('/sign-tx', async (req, res, next) => {
    const {
        senderAccountSecKey,
        receiverAccountPubKey,
        amount,
        description
    } = req.body;

    const resp = await bantuBlockchain.signTransaction(senderAccountSecKey, receiverAccountPubKey, amount, description);
    // console.log(resp);

    const resp2 = await bantuBlockchain.sendCoin(resp);
    return res.status(200).json({
        ...resp2
    });
})

module.exports = app;