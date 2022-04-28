import { getWalletConstructor } from "./walletActions";
import { checkErrors } from "./errorsActions";
import store from "../store";
import {
  SET_POOL_INFO,
  SET_DISABLE_SWAP,
  SET_SWAP_STATUS,
  SET_FIELD,
  SET_SWAP_RATE,
  SET_TOKEN_IN,
  SET_TOKEN_OUT,
  SET_SLIPPAGE,
  SET_RATE_AMOUT,
  SET_SLIPPAGE_TOLERANCE,
  SET_OUT_AMOUNT,
  SET_SWAP_FEE,
  SET_FROM_USD_PRICE,
  SET_TO_USD_PRICE,
  SET_POOLS_LIST,
  SET_PREPARE_TRANSFER_RESPONSE
} from "./types";
import {getAllPools} from '../../networking/osmosisMethods/swapRouter/poolLists'
import BigNumber from "bignumber.js";
import { getOutAmountRoute } from '../../networking/osmosisMethods/swapRouter/getOutAmountRoute.js'
import { getInAmountRoute } from '../../networking/osmosisMethods/swapRouter/getInAmountRoute'
export const loadSwapPools = () => async(dispatch) => {
  let { swapPools } = await getAllPools()
  console.log('--swapPools updated')
  dispatch({
    type: SET_POOLS_LIST,
    payload: swapPools,
  });
  setTimeout(() => {
    dispatch(loadSwapPools())
  },60000)
}

export const setRateAmount = (amount) => (dispatch) => {
  dispatch({
    type: SET_RATE_AMOUT,
    payload: amount,
  });
};
export const setSwapDisable = (status) => (dispatch) => {
  dispatch({
    type: SET_DISABLE_SWAP,
    payload: status,
  });
};
export const setSwapStatus = (status) => (dispatch) => {
  dispatch({
    type: SET_SWAP_STATUS,
    payload: status,
  });
};

export const setSlippageTolerance = (procent) => (dispatch) => {
  dispatch({
    type: SET_SLIPPAGE_TOLERANCE,
    payload: procent,
  });
};

export const prepareSwapTransfer =
  (isExact, formattedAmounts) => (dispatch) => {
    dispatch(setSwapDisable(true));
    const wallet = getWalletConstructor();
    const { fromToken, toToken } = store.getState().walletReducer;
    const { slippageTolerance, poolInfo } =
      store.getState().swapReducer;
    const transaction = wallet.generateSwapTransaction(
      isExact,
      fromToken,
      formattedAmounts["INPUT"],
      toToken,
      formattedAmounts["OUTPUT"],
      slippageTolerance,
      poolInfo,
    );
    wallet
      .prepareTransfer(transaction)
      .then(res => {
        if (res.ok) {
          dispatch({
            type: SET_PREPARE_TRANSFER_RESPONSE,
            payload: res.data,
          });
        } else {
          dispatch(checkErrors(res.data));
        }
      })
      .catch((err) => {
        dispatch(checkErrors(err));
      });
    setTimeout(() => {
      dispatch(setSwapDisable(false));
    }, 5000);
  };

export const swapTokens = (fromTokenAmount) => (dispatch) => {
  const tokenIn = store.getState().swapReducer.tokenIn;
  const tokenOut = store.getState().swapReducer.tokenOut;
  dispatch({
    type: SET_TOKEN_IN,
    payload: tokenOut,
  });
  dispatch({
    type: SET_TOKEN_OUT,
    payload: tokenIn,
  });
  dispatch(calculateSpotPriceWithoutSwapFee(false));
  dispatch(calculateSlippage(fromTokenAmount));
};
export const setIndependentField = (field) => (dispatch) => {
  dispatch({
    type: SET_FIELD,
    payload: field,
  });
};

export const updateSwapInfo = (amount = 0, isOut = true) => async (dispatch) => {
    try {
      let res = {error: true};
      const { fromToken, toToken } = store.getState().walletReducer;
      if (+amount > 0) {
        if(isOut){
          res = await getOutAmountRoute(fromToken.code,toToken.code,amount)
        }else{
          res = await getInAmountRoute(fromToken.code,toToken.code,amount)
        }
      
      }
      if (!res.error) {
        dispatch({
          type: SET_OUT_AMOUNT,
          payload: res.estimateOutAmount || res.estimateInAmount,
        });
        dispatch({
          type: SET_POOL_INFO,
          payload: res.poolRoute,
        });
        dispatch({
          type: SET_SWAP_RATE,
          payload: res.estimateRate,
        });
        dispatch({
          type: SET_SLIPPAGE,
          payload: res.estimateSlippage,
        });
        dispatch({
          type: SET_SWAP_FEE,
          payload: res.swapFee,
        });
        dispatch({
          type: SET_FROM_USD_PRICE,
          payload: res.poolRoute[0]?.from?.usdPrice,
        });
        dispatch({
          type: SET_TO_USD_PRICE,
          payload: res.poolRoute[res.poolRoute?.length - 1]?.to?.usdPrice,
        });
        if (res.poolRoute.length) {
          if (res.poolRoute[0].from.denom === fromToken?.denom) {
            dispatch({
              type: SET_TOKEN_IN,
              payload: res.poolRoute[0]?.from,
            });
          } else {
            dispatch({
              type: SET_TOKEN_OUT,
              payload: res.poolRoute[0]?.to,
            });
          }
        }
      }
      if(res.error || +amount == 0){
        dispatch({
          type: SET_OUT_AMOUNT,
          payload: 0,
        });
        dispatch({
          type: SET_POOL_INFO,
          payload: null,
        });
        dispatch({
          type: SET_SWAP_RATE,
          payload: null,
        });
        dispatch({
          type: SET_SLIPPAGE,
          payload: null,
        });
        dispatch({
          type: SET_SWAP_FEE,
          payload: null,
        });
        dispatch({
          type: SET_FROM_USD_PRICE,
          payload: null,
        });
        dispatch({
          type: SET_TO_USD_PRICE,
          payload: null,
        });
      }
      dispatch(checkSwapStatus(amount, isOut));
    } catch (err) {
      dispatch(checkSwapStatus(amount, isOut));
      dispatch(checkErrors(err));
    }
  };

export const clearRouteInfo = () => (dispatch) => {
  dispatch({
    type: SET_OUT_AMOUNT,
    payload: 0,
  });
  dispatch({
    type: SET_POOL_INFO,
    payload: null,
  });
  dispatch({
    type: SET_SWAP_RATE,
    payload: null,
  });
  dispatch({
    type: SET_SLIPPAGE,
    payload: null,
  });
  dispatch({
    type: SET_SWAP_FEE,
    payload: null,
  });
  dispatch({
    type: SET_FROM_USD_PRICE,
    payload: null,
  });
  dispatch({
    type: SET_TO_USD_PRICE,
    payload: null,
  });

  dispatch({
    type: SET_TOKEN_IN,
    payload: null,
  });
  dispatch({
    type: SET_TOKEN_OUT,
    payload: null,
  });
};

export const getFromBalance = () => (dispatch) => {
  const { fromToken, currentWallet } = store.getState().walletReducer;
  if (fromToken?.code === currentWallet?.code)
    return currentWallet?.balance?.mainBalance;
  if (fromToken?.balance) return fromToken?.balance;
  return 0;
};

export const checkSwapStatus = (amount, name) => (dispatch) => {
  const balance = dispatch(getFromBalance());
  const { slippage, slippageTolerance, outAmout, rate } =
    store.getState().swapReducer;
  const { fromToken, currentWallet } = store.getState().walletReducer;
  let feeProcent = currentWallet?.code == fromToken?.symbol ? 0.01 : 0;
  if (!name) {
    amount = outAmout;
  }
  if(!rate && amount > 0){
    dispatch(setSwapStatus("unavailable"));
    return
  }
  if (+amount > 0) {
    if (+amount > +balance) {
      dispatch(setSwapStatus("insufficientBalance"));
    } else if (+amount <= BigNumber(balance).minus(feeProcent).toNumber()) {
      if (slippage < +slippageTolerance) {
        dispatch(setSwapStatus("swap"));
      } else {
        dispatch(setSwapStatus("swapAnyway"));
      }
    } else {
      dispatch(setSwapStatus("feeError"));
    }
  } else {
    dispatch(setSwapStatus("enterAmount"));
  }
};
