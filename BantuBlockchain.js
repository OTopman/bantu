const stellarSdk = require('stellar-sdk');
const axios = require('axios').default;
axios.defaults.timeout = 1000 * 60 * 3;

const baseUrl = 'https://expansion-testnet.bantu.network'; // TODO:: To be loaded from environment variable
const networkPassphrase = 'Bantu Testnet' // TODO:: To be loaded from environment variable

const stellarServer = new stellarSdk.Server(baseUrl);

function BantuBlockchain() { }

function errorHandler(err) {
    console.log(err);
    if (err.response) {

        if (err.response.data.extras) {
            return {
                error: err.response.data.extras.reason,
                status: err.response.status,
            }
        }
        return {
            error: err.response.data.detail,
            status: err.response.status,
        }
    } else if (err.request) {
        return {
            error: err.request.message,
            status: err.response.status || 500,
        }
    } else {
        return {
            error: err.message,
            status: 500,
        }
    }
}

BantuBlockchain.prototype.createWallet = function () {
    const pair = stellarSdk.Keypair.random();
    return {
        accountPubKey: pair.publicKey(),
        accountSecKey: pair.secret()
    };
}

BantuBlockchain.prototype.activateWallet = async function (accountPubKey) {
    const res = await axios({
        method: 'GET',
        url: `https://friendbot.dev.bantu.network?addr=${encodeURIComponent(accountPubKey)}`,
    }).catch(errorHandler);
    return res.data;
}

BantuBlockchain.prototype.walletBalance = async function (accountPubKey) {
    const res = await stellarServer.loadAccount(accountPubKey).catch(errorHandler);
    return res;
}

BantuBlockchain.prototype.signTransaction = async function (senderAccountSecKey, receiverAccountPubKey, amount, description) {
    const sourceAccountKey = stellarSdk.Keypair.fromSecret(senderAccountSecKey);

    // Check if account exists on Bantu blockchain
    const account = await stellarServer.loadAccount(receiverAccountPubKey).catch(errorHandler);

    // console.log(account);
    const senderAccount = await stellarServer.loadAccount(sourceAccountKey.publicKey()).catch(errorHandler);

    // Add memo, set wait 3 mins for transaction, and build transaction
    const tx = new stellarSdk.TransactionBuilder(senderAccount, {
        fee: stellarSdk.BASE_FEE,
        networkPassphrase: networkPassphrase
    }).addOperation(stellarSdk.Operation.payment({
        destination: receiverAccountPubKey,
        asset: stellarSdk.Asset.native(),
        amount: Number(amount).toString(),
    })).addMemo(stellarSdk.Memo.text(description)).setTimeout(180).build();

    // Sign transaction
    tx.sign(sourceAccountKey);
    // const res = await stellarServer.submitTransaction(tx);
    // console.log(res);
    
    return tx;
}

BantuBlockchain.prototype.sendCoin = async function (tx) {
    // Send to bantu for processing and return response
    return new stellarServer.submitTransaction(tx).catch(errorHandler);
}

BantuBlockchain.prototype.fetchHistory = async function (accountPubKey) {
    const res = await axios({
        method: 'GET',
        url: `${baseUrl}/accounts/${accountPubKey}/transactions`
    }).catch(errorHandler);

    return res.data;
}

module.exports = BantuBlockchain;