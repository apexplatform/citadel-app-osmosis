import store from '../../store/store.js';
import  { getWalletConstructor } from '../../store/actions/walletActions'
import { getOutAmountRoute } from './swapRouter/getOutAmountRoute.js'
import { networks } from '../models/network.js'
import types from '../../store/actions/types';
const qs = require("querystring");
const params = window.location.search.slice(1);
const paramsAsObject = qs.parse(params);

export const getSwapInfoByUrl = async() => {
    const { swapPools } = store.getState().swap
    let keys = Object.keys(paramsAsObject)
    if(paramsAsObject.amountIn && paramsAsObject.tokenIn && paramsAsObject.tokenOut && keys.length == 3){
        if(swapPools){
            const res = await getOutAmountRoute(paramsAsObject.tokenIn,paramsAsObject.tokenOut,paramsAsObject.amountIn)
            store.dispatch({
                type: types.SET_SWAP_INFO,
                payload: res })
        }else{
            setTimeout(() => {
                getSwapInfoByUrl()
            },5000)
        }
    }
    
}

export const buildSwapTx = async() => {
    const { swapPools } = store.getState().swap
    if(paramsAsObject.address && paramsAsObject.net && paramsAsObject.amountIn && paramsAsObject.tokenIn && paramsAsObject.tokenOut){   
        if(swapPools){
            const res = await getOutAmountRoute(paramsAsObject.tokenIn,paramsAsObject.tokenOut,paramsAsObject.amountIn)
            const walletInfo = {
                address: paramsAsObject.address,
                network: paramsAsObject.net,
                name: networks[paramsAsObject.net].name,
                code: networks[paramsAsObject.net].code,
                getTxUrl:  networks[paramsAsObject.net].getTxUrl
              }
            let slippageTolerance = paramsAsObject.slippage || 1
            const wallet = getWalletConstructor(walletInfo);
            const fromToken = {
                code: paramsAsObject.tokenIn,
                decimals: 6
            }
            const toToken = {
                code: paramsAsObject.tokenOut,
                decimals: 6
            }
            const transaction = wallet.generateSwapTransaction(
                true,
                fromToken,
                res.amount,
                toToken,
                res.estimateOutAmount,
                slippageTolerance,
                res.poolRoute,
              );
              wallet
                .prepareTransfer(transaction)
                .then(res => {
                    console.log(res)
                    return res
                })
                .catch((err) => {
                    console.log(err)
                    return err
                });
        }else{
            setTimeout(() => {
                buildSwapTx()
            },5000)
        }
    }
    
}
