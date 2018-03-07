import * as transactionStates from './transaction-states';
import * as contract from '../contract/TenTiles.json';
import Utils from './utils';
import axios from "axios/index";

export function Blockchain() {
    this.contractInstance = new web3.eth.Contract(contract.abi, contract.address);
}

Blockchain.prototype.getAddress = function () {
    return new Promise(function (resolve, reject) {
        web3.eth.getCoinbase(function (err, res) {
            err ? reject(err) : resolve(res);
        });
    });
};

Blockchain.prototype.getAllTiles = function () {

    let promises = [];

    for(let i=0;i<10;i++){
        const tilePromise = new Promise(function (resolve, reject) {
            this.contractInstance.methods.tileStructs(i).call({from: this.address},function (err, res) {
                err ? reject(err) : resolve(res);
            });
        }.bind(this));

        promises.push(tilePromise);
    }

    return new Promise(function (resolve, reject) {
        Promise.all(promises).then(function (result) {
            resolve(result);
        })
    })
};

Blockchain.prototype.buyTile = function (index) {
    this.contractInstance.methods.tileStructs(i).call({from: this.address},function (err, res) {
        err ? reject(err) : resolve(res);
    });
};

Blockchain.prototype.checkTransaction = function (transaction) {

    const txPromise = new Promise(function (resolve, reject) {
        web3.eth.getTransaction(transaction.transactionHash, function (err, res) {
            err ? reject(err) : resolve(res);
        });
    });

    const txReceiptPromise = new Promise(function (resolve, reject) {
        web3.eth.getTransactionReceipt(transaction.transactionHash, function (err, res) {
            err ? reject(err) : resolve(res);
        });
    });

    return new Promise(function (resolve, reject) {
        Promise.all([txPromise, txReceiptPromise]).then(function (res) {
            const tx = res[0];
            const txReceipt = res[1];
            const succeeded = txReceipt && txReceipt.blockNumber && txReceipt.gasUsed < tx.gas;
            const failed = txReceipt && txReceipt.blockNumber && txReceipt.gasUsed === tx.gas;

            let state = transactionStates.STATE_PENDING;
            if (succeeded) {
                state = transactionStates.STATE_SUCCEEDED;
            } else if (failed) {
                state = transactionStates.STATE_FAILED;
            }
            resolve(state);
        });
    });
};

export default Blockchain;