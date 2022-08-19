import { types } from './types';
import { WalletList } from '../../networking/models/WalletList';
import { ValidationError } from '../../networking/models/Errors';
import { errorActions, usersActions } from './index';
import { getRequest } from '../../networking/requests/getRequest';
import { store } from '../store';
import models from '../../networking/models';
import Wallet from '../../networking/models/Wallet';
import { utils } from '@citadeldao/apps-sdk';
import { logos } from "../../networking/osmosisMethods/osmosis-logo";
import axios from 'axios'
const getWalletConstructor = (address) => {
    try {
        const { activeWallet } = store.getState().wallet;
        const currentWallet = address || activeWallet;
        const WalletConstructor = models[currentWallet.network.toUpperCase()];

        if (WalletConstructor) {
            return new WalletConstructor(currentWallet);
        }

        return new Wallet(currentWallet);
    } catch {
        new Error('Wallet doesn\'t exists ');
    }
};


const loadWalletWithBalances = () => async (dispatch) => {
    const walletList = new WalletList();
    walletList.loadWalletsWithBalances().then(wallets => {
        if (wallets instanceof ValidationError) {
            dispatch(errorActions.checkErrors(wallets));
            stopSplashLoader();
            return;
        }
        dispatch({
            type: types.SET_WALLETS,
            payload: wallets,
        });
        axios.get(process.env.REACT_APP_MAIN_SERVER_URL + '/currency/osmosis').then(res => {
            store.dispatch({
                type: types.SET_USD_PRICE,
                payload: res?.data?.data?.USD
            })
        })
        usersActions.loadUserConfig().then(user_configs => {
            let flag = false;
            wallets?.forEach((item) => {
                if(item.address === user_configs?.lastWalletInfo?.address){  
                    flag = true
                    setTimeout(()=>{
                        dispatch(setActiveWallet(item,false))
                    },1000) 
                }
                if (!flag) {
                    dispatch(setActiveWallet(wallets[0]));
                }
            })
        }).catch(() => {
            dispatch(setActiveWallet(wallets[0]));
            setTimeout(() => {
                stopSplashLoader();
            }, 1000);
        });
    });
};

const loadNetworks = () => async(dispatch) => {
    try{
        const rm = new utils.RequestManager()
        const networks = await rm.send(getRequest('wallet').getNetworks())
        dispatch({
            type: types.SET_NETWORKS,
            payload: networks
        })
    } catch {}
}


const loadStakeNodes = () => async(dispatch) => {
    try{
        const rm = new utils.RequestManager()
        const res = await rm.send(getRequest('wallet').getStakeNodes())
        dispatch({
            type: types.SET_STAKE_NODES,
            payload: res.data?.osmosis,
        })
    } catch {}
}


const preparePermissionTransfer = async (address, status, minAmount) => {
    const wallet = getWalletConstructor(address);
    let d = new Date();
    let year = d.getFullYear();
    let month = d.getMonth();
    let day = d.getDate();
    let expiryDate = new Date(year + 2, month, day);
    let data = {
        status, expiryDate: expiryDate.toISOString(),
    };
    if (+minAmount > 0) {
        data.minAmount = +minAmount;
    }
    const transaction = await wallet.setPermissionRestake(data);
    wallet.prepareTransfer(transaction.data).then((res) => {
        if (res.ok) {
            return store.dispatch({
                type: types.SET_PREPARE_TRANSFER_RESPONSE,
                payload: { transaction: transaction.data, wallet },
            });
        } else {
            store.dispatch(errorActions.checkErrors(res.data));
        }
    }).catch((err) => {
        store.dispatch(errorActions.checkErrors(err));
    });
};

const stopSplashLoader = () => {
    setTimeout(() => {
        document.getElementById('root').style.display = 'block';
        document.getElementById('splash').style.display = 'none';
    }, 3000);
};

const setActiveWallet = (wallet, save = true) => async(dispatch) => {
    dispatch({
        type: types.SET_ACTIVE_WALLET,
        payload: wallet,
    });
    dispatch({
        type: types.SET_TOKENS,
        payload: []
    })
    dispatch({
        type: types.SET_ALL_POOLS,
        payload: [],
      });
    dispatch({
        type: types.SET_SELECTED_TOKENS,
        payload: [],
    });
    if(save){
        const config = {
            lastWalletInfo: {
                address: wallet.address,
                network: wallet.network
            }
        }
        usersActions.setUserConfig(config)
    }
    await loadTokenBalances(wallet)
}


const loadTokenBalances = async(address) => {
    const wallet = getWalletConstructor(address)
    const { networks } = store.getState().wallet
    const { tokenIn, tokenOut } = store.getState().swap;
    if(wallet && networks){
        const balances = await wallet.getAllTokenBalance()
        let tokenList = []
        let osmosisToken = networks?.osmosis;
        if (osmosisToken) {
            let keys2 = Object.keys(osmosisToken?.tokens);
            let osmosis = {
                network: "osmosis",
                code: "OSMO",
                decimals: "6",
                denom: "uosmo",
                name: "Osmosis",
                fullDenom: "uosmo",
                logoURI: "img/tokens/osmosis.svg",
                balance: address?.balance?.mainBalance || 0,
            };
            const keys = balances.data ? Object.keys(balances.data) : [];
            tokenList.push(osmosis);
            keys2.forEach((elem) => {
                if(elem !== 'osmosis_terra-krt'){
                    osmosisToken.tokens[elem].balance = 0;
                    osmosisToken.tokens[elem].name = osmosisToken.tokens[elem].name.replace(
                    "IBC ",
                    ""
                    );
                    osmosisToken.tokens[elem].logoURI = logos[elem]?.logoURI || "img/tokens/unsupported.svg";
                    osmosisToken.tokens[elem].network = 'osmosis'
                    tokenList.push(osmosisToken.tokens[elem]);
                }
            });
            keys?.forEach((net) => {
                tokenList.forEach((token, i) => {
                if (token.net === net) {
                    tokenList[i].balance = balances.data[net].amount;
                    tokenList[i].USD = balances.data[net].price?.USD;
                }
                if (tokenIn?.code === tokenList[i].code) {
                    tokenIn.balance = tokenList[i].balance;
                } else if (tokenOut?.code === tokenList[i].code) {
                    tokenOut.balance = tokenList[i].balance;
                }
                });
            });
        }
        store.dispatch({
            type: types.SET_TOKENS,
            payload: tokenList
        })
        store.dispatch({
            type: types.SET_TOKEN_IN,
            payload: !tokenIn ? tokenList[0] : tokenIn,
          });
        store.dispatch({
            type: types.SET_TOKEN_OUT,
            payload: !tokenOut ? tokenList.find(token => token.code === 'ATOM') : tokenOut,
          });
    }

    setTimeout(()=>{
        stopSplashLoader()
    },1000) 
}

const updateWalletList = async(wallet) => {
    let { wallets, activeWallet, networks } = store.getState().wallet
    let metaMaskWallet = wallets && wallets.find(elem => elem.from === 'metamask')
    if(metaMaskWallet){
        let updateActiveWallet = false
        if(metaMaskWallet.network === wallet.net && wallet.address){
            if(metaMaskWallet.address === activeWallet.address){
                updateActiveWallet = true
            }
            metaMaskWallet.address = wallet.address
            const walletInstance = getWalletConstructor(metaMaskWallet)
            const response = await walletInstance.getWalletBalance()
            metaMaskWallet.balance = response.data.mainBalance
            if(updateActiveWallet){
                store.dispatch(setActiveWallet(metaMaskWallet))
            }
        }else{
            wallets = wallets.filter(elem => elem.from !== 'metamask')
            if(wallets.length === 0){
                store.dispatch(setActiveWallet(null))
                store.dispatch(errorActions.checkErrors(new ValidationError())) 
            }
        }
    }else{
        const walletList = new WalletList()
        wallet.network = wallet.net
        wallet.name = networks[wallet?.net]?.name
        wallet.code = networks[wallet?.net]?.code
        wallet.decimals = networks[wallet?.net]?.decimals
        wallet.from = 'metamask'
        wallet.getTxUrl = walletList.getTxUrl(wallet?.net)
        const walletInstance = getWalletConstructor(wallet)
        const response = await walletInstance.getWalletBalance()
        wallet.balance = response.data.mainBalance
        wallets = wallets.concat([wallet])
        if(!activeWallet){
            store.dispatch(setActiveWallet(wallet))
        }
        store.dispatch(errorActions.clearErrors())
    }
    store.dispatch({
        type: types.SET_WALLETS,
        payload: wallets
    })
}

export const walletActions = {
    getWalletConstructor,
    loadWalletWithBalances,
    loadNetworks,
    preparePermissionTransfer,
    stopSplashLoader,
    setActiveWallet,
    loadTokenBalances,
    updateWalletList,
    loadStakeNodes
};