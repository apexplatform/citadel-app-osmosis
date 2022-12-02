import { store } from "../store";
import { types } from "./types";
import { walletActions, errorActions } from "./index";
import BigNumber from 'bignumber.js';
import { getAllPools } from '../../networking/osmosisMethods/swapRouter/poolLists'
import { getOutAmountRoute } from '../../networking/osmosisMethods/swapRouter/getOutAmountRoute.js'
import { getInAmountRoute } from '../../networking/osmosisMethods/swapRouter/getInAmountRoute'
import { prettyNumber } from "../../components/helpers/numberFormatter";
const loadSwapPools = () => async(dispatch) => {
  let { swapPools } = await getAllPools()
  if(swapPools?.length < 100){
    dispatch(loadSwapPools())
  }
  dispatch({
    type: types.SET_POOLS_LIST,
    payload: swapPools,
  });
  setTimeout(() => {
    dispatch(loadSwapPools())
  },60000)
}

const setRateAmount = (amount) => (dispatch) => {
  dispatch({
    type: types.SET_RATE_AMOUT,
    payload: amount,
  });
};
const setSwapDisable = (status) => (dispatch) => {
  dispatch({
    type: types.SET_DISABLE_SWAP,
    payload: status,
  });
};
const setSwapStatus = (status) => (dispatch) => {
  dispatch({
    type: types.SET_SWAP_STATUS,
    payload: status,
  });
};
  
const setSlippageTolerance = (procent) => (dispatch) => {
  dispatch({
    type: types.SET_SLIPPAGE_TOLERANCE,
    payload: procent,
  });
  const { amount } = store.getState().swap
  dispatch(checkSwapStatus(amount))
};

const setIndependentField = (field) => (dispatch) => {
  dispatch({
    type: types.SET_FIELD,
    payload: field,
  });
};

const setAmount = (amount, isExactIn=true) => (dispatch) => {
  dispatch({
    type: types.SET_AMOUNT,
    payload: amount,
  });
  dispatch({
    type: types.SET_EXACT_IN,
    payload: isExactIn,
  });
};

const setTokenIn = (token) => (dispatch) => {
  clearSwapInfo()
  dispatch({
    type: types.SET_TOKEN_IN,
    payload: token,
  });
  const { amount,isExactIn } = store.getState().swap
  dispatch(getSwapInfo(amount, isExactIn))
};

const setTokenOut = (token) => (dispatch) => {
  clearSwapInfo()
  dispatch({
    type: types.SET_TOKEN_OUT,
    payload: token,
  });
  const { amount,isExactIn } = store.getState().swap
  dispatch(getSwapInfo(amount, isExactIn))
};

const setSelectedToken = (token) => (dispatch) => {
  dispatch({
    type: types.SET_SELECTED_TOKEN,
    payload: token,
  });
};

const getSwapInfo = (amount = 0, isOut = true) => async(dispatch) => {
  try {
    let res = {error: true};
    const { tokenIn, tokenOut } = store.getState().swap;
    if (+amount > 0) {
      if(isOut){
        res = await getOutAmountRoute(tokenIn,tokenOut,amount)
      }else{
        res = await getInAmountRoute(tokenIn,tokenOut,amount)
      }
    }
    if (!res.error) {
      dispatch({
        type: types.SET_OUT_AMOUNT,
        payload: res.estimateOutAmount || res.estimateInAmount,
      });
      dispatch({
        type: types.SET_SWAP_ROUTE,
        payload: res.poolRoute,
      });
      dispatch({
        type: types.SET_SWAP_RATE,
        payload: res.estimateRate,
      });
      dispatch({
        type: types.SET_SLIPPAGE,
        payload: res.estimateSlippage,
      });
      dispatch({
        type: types.SET_SWAP_FEE,
        payload: res.swapFee,
      });
      dispatch({
        type: types.SET_FROM_USD_PRICE,
        payload: res.poolRoute && res.poolRoute[0]?.from?.usdPrice,
      });
      dispatch({
        type: types.SET_TO_USD_PRICE,
        payload: res.poolRoute && res.poolRoute[res.poolRoute?.length - 1]?.to?.usdPrice,
      });
      dispatch({
        type: types.SET_TRADE,
        payload: res,
      });
    }else if(+amount > 0){
      dispatch(errorActions.checkErrors(res.error))
    }
    if(res.error || +amount === 0){
      clearSwapInfo()
    }
    dispatch(checkSwapStatus(amount, res.error));
  } catch (err) {
    dispatch(checkSwapStatus(amount));
  }
}

const clearSwapInfo = () => {
  store.dispatch({
    type: types.SET_OUT_AMOUNT,
    payload: 0,
  });
  store.dispatch({
    type: types.SET_SWAP_ROUTE,
    payload: null,
  });
  store.dispatch({
    type: types.SET_SWAP_RATE,
    payload: null,
  });
  store.dispatch({
    type: types.SET_SLIPPAGE,
    payload: null,
  });
  store.dispatch({
    type: types.SET_SWAP_FEE,
    payload: null,
  });
  store.dispatch({
    type: types.SET_FROM_USD_PRICE,
    payload: null,
  });
  store.dispatch({
    type: types.SET_TO_USD_PRICE,
    payload: null,
  });
}

const getSwapTransaction = (formattedAmounts) => {
    store.dispatch(setSwapDisable(true));
    const { tokenIn, tokenOut, slippageTolerance, isExactIn, routes, trade } = store.getState().swap;
    const { activeWallet } = store.getState().wallet;
    const wallet = walletActions.getWalletConstructor(activeWallet);
    const transaction = wallet.generateSwapTransaction(
      isExactIn,
      tokenIn,
      formattedAmounts["INPUT"],
      tokenOut,
      formattedAmounts["OUTPUT"],
      slippageTolerance,
      routes,
      trade
    );
    wallet
      .prepareTransfer(transaction)
      .then(res => {
        if (res.ok) {
          store.dispatch({
            type: types.SET_PREPARE_TRANSFER_RESPONSE,
            payload: res.data,
          });
        } else {
          store.dispatch(errorActions.checkErrors(res.data));
        }
      })
      .catch((err) => {
        store.dispatch(errorActions.checkErrors(err));
      });
    setTimeout(() => {
      store.dispatch(setSwapDisable(false));
    }, 5000);
  };


const checkSwapStatus = (amount, error) => dispatch => {
  const { tokenIn, slippage, slippageTolerance, outAmout, isExactIn } = store.getState().swap
  const { activeWallet } = store.getState().wallet
  const balance = tokenIn?.balance
  let feeProcent = activeWallet?.code === tokenIn?.code ? 0.1 : 0
  if(!isExactIn){
    amount = prettyNumber(outAmout,6,true)
  }
  if(error || prettyNumber(outAmout,6,true) === 0){
    dispatch(setSwapStatus('disabled'))
    return
  }
  if(+amount > 0) {
    if(+amount > +balance){
      dispatch(setSwapStatus('insufficientBalance'))
    } else if(+amount <= BigNumber(+balance).minus(feeProcent).toNumber() && +activeWallet?.balance?.mainBalance > 0){
      if(+BigNumber(slippage * 100).toFixed(3) > +slippageTolerance){
        dispatch(setSwapStatus('swapAnyway'))
      } else{
        dispatch(setSwapStatus('swap'))
      } 
      } else {
        dispatch(setSwapStatus('feeError'))
      }
    } else {
      dispatch(setSwapStatus('enterAmount'))
    }
}


export const swapActions = {
  setRateAmount,
  setSwapDisable,
  setSwapStatus,
  setSlippageTolerance,
  setIndependentField,
  setAmount,
  setTokenIn,
  setTokenOut,
  setSelectedToken,
  getSwapInfo,
  getSwapTransaction,
  checkSwapStatus,
  loadSwapPools
};