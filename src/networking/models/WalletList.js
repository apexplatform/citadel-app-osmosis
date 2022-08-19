import { ValidationError } from './Errors';
import { walletActions } from '../../store/actions';
import axios from 'axios';
import { types } from '../../store/actions/types' 
import { store } from '../../store/store'
export class WalletList {
    getTxUrl(net) {
        if (net === 'eth') {
            return (txHash) => `https://etherscan.io/tx/${txHash}`;
        } else if (net === 'bsc') {
            return (txHash) => `https://bscscan.com/tx/${txHash}`;
        } else if (net === 'orai') {
            return (txHash) => `https://scan.orai.io/txs/${txHash}`;
        } else if (net === 'cheqd') {
            return (txHash) => `https://explorer.cheqd.io/transactions/${txHash}`;
        } else {
            return (txHash) => `https://www.mintscan.io/${net}/txs/${txHash}`;
        }
    }

    async getWallets() {
        try {
            const qs = require('querystring');
            const params = window.location.search.slice(1);
            const paramsAsObject = qs.parse(params);
            let arr = JSON.parse(paramsAsObject.wallets);
            let wallets = null;
            const res = await axios.get(process.env.REACT_APP_MAIN_SERVER_URL + '/networks.json');
            let networks = res.data
            store.dispatch({
                type: types.SET_NETWORKS,
                payload: networks
            })
            // eslint-disable-next-line
            wallets = arr.length ? eval(paramsAsObject.wallets).map(item => {
                return {
                    address: item?.address,
                    network: item?.net,
                    name: networks[item?.net]?.name,
                    code: networks[item?.net]?.code,
                    decimals: networks[item?.net]?.decimals,
                    publicKey: item?.publicKey,
                    getTxUrl: this.getTxUrl(item?.net),
                };
            }) : new ValidationError();
            return wallets;
        } catch (e) {
            return new ValidationError(e);
        }
    }

    async loadWalletsWithBalances() {
        const wallets = await this.getWallets();
        if (wallets instanceof ValidationError) {
            return wallets;
        }
        try {
            if (wallets.length > 0) {
                wallets.forEach(async (item) => {
                    const wallet = walletActions.getWalletConstructor(item);

                    if (wallet) {
                        let response = await wallet.getWalletBalance();
                        if (response.ok) {
                            item.balance = response.data;
                        } else {
                            response = await wallet.getWalletBalance();
                            item.balance = response?.data;
                        }
                    }
                });
            }
        } catch {
        }
        return wallets;
    }

}

