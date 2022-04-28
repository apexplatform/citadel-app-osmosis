import {
  SET_OPENED_POOL,
  SET_PREPARE_TRANSFER_RESPONSE,
  SET_TOKEN_BALANCES,
  SET_LIQUIDITY_METHOD,
  SET_INCENTIVIZED_POOLS,
  SET_ALL_POOLS,
  SET_SELECTED_TOKENS,
  SET_OSMOSIS_PRICE,
  SET_ACTIVE_MODAL,
  SET_SELECTED_NODE,
  SET_SUPERFLUID_DELEGATIONS,
  SET_IS_SUPERFLIUD
} from "./types";
import { getWalletConstructor } from "./walletActions";
import { checkErrors } from "./errorsActions";
import {loadPoolData} from '../../networking/osmosisMethods/poolMethods'
import store from "../store";
export const setSelectedPool = (pool) => (dispatch) => {
  dispatch({
    type: SET_OPENED_POOL,
    payload: pool,
  });
};

export const getPoolData = () => (dispatch) => {
  try{
    loadPoolData()
  }catch{}
}

export const setIsSuperfluidLock = (pool) => (dispatch) => {
  dispatch({
    type: SET_IS_SUPERFLIUD,
    payload: pool,
  });
};

export const setSelectedNode = (node) => (dispatch) => {
  dispatch({
    type: SET_SELECTED_NODE,
    payload: node,
  });
};

export const setSelectedTokens = (tokens) => (dispatch) => {
  dispatch({
    type: SET_SELECTED_TOKENS,
    payload: tokens,
  });
};

export const setPoolMethod = (pool) => (dispatch) => {
  dispatch({
    type: SET_LIQUIDITY_METHOD,
    payload: pool,
  });
};

export const loadPoolList = (count = 0) => async (dispatch) => {
  try {
    const wallet = getWalletConstructor();
    const { currentWallet } = store.getState().walletReducer;
    if (wallet) {
      const { status, data } = await wallet.getPools();
        console.log(status,'--pool list status', data)
        if(status){
        const { incentivizedPools, mintPrice, allPools, balancesResponse, superfluidDelegations} = data
          dispatch({
            type: SET_INCENTIVIZED_POOLS,
            payload: incentivizedPools,
          });
          dispatch({
            type: SET_OSMOSIS_PRICE,
            payload: mintPrice,
          });
          dispatch({
            type: SET_ALL_POOLS,
            payload: allPools,
          });
          dispatch({
            type: SET_TOKEN_BALANCES,
            payload: balancesResponse?.data?.result,
          });
          dispatch({
            type: SET_SUPERFLUID_DELEGATIONS,
            payload: superfluidDelegations,
          });
        }else{
          if(count<=3){
            setTimeout(() => dispatch(loadPoolList(count++)) , 5000)
          }  
        }
     }
    if (currentWallet) {
      dispatch({
        type: SET_ACTIVE_MODAL,
        payload: null,
      });
    }
    return false;
  } catch(err) {
    const start = new Date();
    const end = new Date();
    const now = new Date();
    const index = now.toString().indexOf("GMT");
    const gmt = now.toString().substring(index + 3, index + 8);
    let startTime = 17;
    let startMinute = 0;
    let endTime = 17;
    let endMinute = 30;
    end.setHours(
      eval(endTime + gmt.substring(0, 1) + parseInt(gmt.substring(1, 3)))
    );
    end.setMinutes(
      eval(endMinute + gmt.substring(0, 1) + parseInt(gmt.substring(3)))
    );
    start.setHours(
      eval(startTime + gmt.substring(0, 1) + parseInt(gmt.substring(1, 3)))
    );
    start.setMinutes(
      eval(startMinute + gmt.substring(0, 1) + parseInt(gmt.substring(3)))
    );
    if (now.getTime() > start.getTime() && now.getTime() < end.getTime()) {
      dispatch({
        type: SET_ACTIVE_MODAL,
        payload: "alarm",
      });
      let interval = null;
      let tryAgain = true;
      if (tryAgain) {
        interval = setInterval(async () => {
          tryAgain = await dispatch(loadPoolList());
          if (!tryAgain) {
            clearInterval(interval);
          }
        }, 20000);
      }
      if (!tryAgain) {
        clearInterval(interval);
      }
    }
    return true;
  }
};

export const updatePoolList = () => async (dispatch) => {
  const wallet = getWalletConstructor();
  if (wallet) {
    const { incentivizedPools, allPools, pool } = store.getState().poolReducer;
    if(pool){
      const { poolUpdated, mintPrice, balancesResponse } =
      await wallet.getPoolUpdate(pool);
    if (
      poolUpdated.myLiquidity != pool.myLiquidity ||
      poolUpdated.availableLP != pool.availableLP
    ) {
      let incentivizedPools_ = incentivizedPools.map((item) => {
        if (item.id == poolUpdated.id) {
          item = poolUpdated;
        }
        return item;
      });
      let allPools_ = allPools.map((item) => {
        if (item.id == poolUpdated.id) {
          item = poolUpdated;
        }
        return item;
      });
      dispatch(setSelectedPool(poolUpdated));
      dispatch({
        type: SET_INCENTIVIZED_POOLS,
        payload: incentivizedPools_,
      });
      dispatch({
        type: SET_OSMOSIS_PRICE,
        payload: mintPrice,
      });
      dispatch({
        type: SET_ALL_POOLS,
        payload: allPools_,
      });
      dispatch({
        type: SET_TOKEN_BALANCES,
        payload: balancesResponse?.data?.result,
      });
      return false;
    } else {
      return true;
    }
    } else {
      dispatch(loadPoolList())
      return false
    }
  }
};

export const prepareJoinPoolTransaction =
  (amounts, shareOutAmount, singleLp) => (dispatch) => {
    const wallet = getWalletConstructor();
    const { pool } = store.getState().poolReducer;
    const { slippageTolerance } = store.getState().swapReducer;
    if (wallet) {
      let transaction = {};
      if (singleLp) {
        transaction = wallet.generateSingleLPJoinPoolTransaction(
          pool,
          amounts,
          slippageTolerance
        );
      } else {
        transaction = wallet.generateJoinPoolTransaction(
          pool,
          amounts,
          shareOutAmount,
          slippageTolerance
        );
      }

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
    }
  };

export const prepareExitPoolTransaction =
  (amounts, shareInAmount) => (dispatch) => {
    const wallet = getWalletConstructor();
    if (wallet) {
      const { pool } = store.getState().poolReducer;
      const { slippageTolerance } = store.getState().swapReducer;
      let transaction = wallet.generateExitPoolTransaction(
        pool,
        amounts,
        shareInAmount,
        slippageTolerance
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
    }
  };

export const prepareLockTokensTransaction =
  (shareInAmount, duration) => (dispatch) => {
    const wallet = getWalletConstructor();
    if (wallet) {
      const { pool } = store.getState().poolReducer;
      let transaction = wallet.generateLockTokensTransaction(
        pool,
        shareInAmount,
        duration
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
    }
  };

export const prepareLockAndDelegateTransaction =
  (shareInAmount, validator) => (dispatch) => {
    const wallet = getWalletConstructor();
    if (wallet) {
      const { pool } = store.getState().poolReducer;
      let transaction = wallet.generateLockAndDelegateTransaction(
        pool,
        shareInAmount,
        validator
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
    }
  };

export const prepareBeginUnlockTokensTransaction = (duration,isSyntheticLock=false) => (dispatch) => {
  const wallet = getWalletConstructor();
  if (wallet) {
    let transaction = wallet.generateBeginUnlockTokensTransaction(duration,isSyntheticLock);
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
  }
};

export const prepareUnlockTokensTransaction = (lockIds) => (dispatch) => {
  const wallet = getWalletConstructor();
  if (wallet) {
    let transaction = wallet.generateUnlockTokensTransaction(lockIds);
    wallet
      .prepareTransfer(transaction)
      .then(res => {
        if (res.ok) {
          dispatch({
            type: SET_PREPARE_TRANSFER_RESPONSE,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        dispatch(checkErrors(err));
      });
  }
};

export const prepareCreatePool = (swapFee) => (dispatch) => {
  const wallet = getWalletConstructor();
  if (wallet) {
    const { selectedTokens } = store.getState().poolReducer;
    let transaction = wallet.generateCreatePoolTransaction(
      selectedTokens,
      swapFee
    );
    wallet
      .prepareTransfer(transaction)
      .then(res => {
        if (res.ok) {
          dispatch({
            type: SET_PREPARE_TRANSFER_RESPONSE,
            payload: res.data,
          });
        }
      })
      .catch((err) => {
        dispatch(checkErrors(err));
      });
  }
};


export const prepareSuperfluidDelegate = (validator,lockData) => (dispatch) => {
  const wallet = getWalletConstructor();
  if (wallet) {
    let transaction = wallet.generateSuperfluidDelegateTransaction(validator,lockData);
    wallet
      .prepareTransfer(transaction)
      .then(res => {
        if (res.ok) {
          dispatch({
            type: SET_PREPARE_TRANSFER_RESPONSE,
            payload: res.data,
          });
        }else{
          dispatch(checkErrors(res.data));
        }
      })
      .catch((err) => {
        dispatch(checkErrors(err));
      });
  }
};
