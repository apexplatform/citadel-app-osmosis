import { types } from "./types";
import { walletActions, errorActions, panelActions } from "./";
import { store } from "../store";
import { loadPoolData } from '../../networking/osmosisMethods/poolMethods'

const getPoolData = () => {
  try{
    loadPoolData()
  }catch{}
}

const setAmount = (amount) => (dispatch) => {
  dispatch({
    type: types.SET_POOL_AMOUNT,
    payload: amount,
  });
};

const setSelectedPool = (pool) => {
  store.dispatch({
    type: types.SET_OPENED_POOL,
    payload: pool,
  });
};

const setIsSuperfluidLock = (pool) => {
  store.dispatch({
    type: types.SET_IS_SUPERFLIUD,
    payload: pool,
  });
};

const setSelectedNode = (node) => {
  store.dispatch({
    type: types.SET_SELECTED_NODE,
    payload: node,
  });
};

const setSelectedTokens = (tokens) => {
  store.dispatch({
    type: types.SET_SELECTED_TOKENS,
    payload: tokens,
  });
};

const setPoolMethod = (pool) => {
  store.dispatch({
    type: types.SET_LIQUIDITY_METHOD,
    payload: pool,
  });
};

const loadPoolList = (count = 0) => async(dispatch) => {
  try {
    const wallet = walletActions.getWalletConstructor();
    const { pool } = store.getState().pool
    if (wallet) {
      const { status, data } = await wallet.getPools();
        if(status){
        const { incentivizedPools, mintPrice, allPools, balancesResponse, superfluidDelegations} = data
          dispatch({
            type: types.SET_INCENTIVIZED_POOLS,
            payload: incentivizedPools,
          });
          dispatch({
            type: types.SET_OSMOSIS_PRICE,
            payload: mintPrice,
          });
          dispatch({
            type: types.SET_ALL_POOLS,
            payload: allPools,
          });
          if(pool && pool.id){
            let updatedPool = allPools.find(elem => elem.id === pool.id)
            if(updatedPool){
              dispatch({
                type: types.SET_OPENED_POOL,
                payload: updatedPool,
              });
            }
          }
          dispatch({
            type: types.SET_TOKEN_BALANCES,
            payload: balancesResponse?.data?.result,
          });
          dispatch({
            type: types.SET_SUPERFLUID_DELEGATIONS,
            payload: superfluidDelegations,
          });
          panelActions.setLoader(false)
        }else{
          if(count<=3){
            setTimeout(() => dispatch(loadPoolList(count++)) , 5000)
          }  
        }
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
    end.setHours(// eslint-disable-next-line
      eval(endTime + gmt.substring(0, 1) + parseInt(gmt.substring(1, 3)))
    );
    end.setMinutes(// eslint-disable-next-line
      eval(endMinute + gmt.substring(0, 1) + parseInt(gmt.substring(3)))
    );
    start.setHours(// eslint-disable-next-line
      eval(startTime + gmt.substring(0, 1) + parseInt(gmt.substring(1, 3)))
    );
    start.setMinutes(// eslint-disable-next-line
      eval(startMinute + gmt.substring(0, 1) + parseInt(gmt.substring(3)))
    );
    if (now.getTime() > start.getTime() && now.getTime() < end.getTime()) {
      dispatch({
        type: types.SET_ACTIVE_MODAL,
        payload: "alarm",
      });
      // let interval = null;
      // let tryAgain = true;
      // if (tryAgain) {
      //   interval = setInterval(async () => {
      //     tryAgain = await dispatch(loadPoolList());
      //     if (!tryAgain) {
      //       clearInterval(interval);
      //     }
      //   }, 20000);
      // }
      // if (!tryAgain) {
      //   clearInterval(interval);
      // }
    }
    return true;
  }
};

const updatePoolList = async() => {
  const wallet = walletActions.getWalletConstructor();
  if (wallet) {
    const { incentivizedPools, allPools, pool } = store.getState().pool;
    if(pool){
      const { poolUpdated, mintPrice, balancesResponse } = await wallet.getPoolUpdate(pool);
    if (
      poolUpdated.myLiquidity !== pool.myLiquidity ||
      poolUpdated.availableLP !== pool.availableLP
    ) {
      let incentivizedPools_ = incentivizedPools.map((item) => {
        if (item.id === poolUpdated.id) {
          item = poolUpdated;
        }
        return item;
      });
      let allPools_ = allPools.map((item) => {
        if (item.id === poolUpdated.id) {
          item = poolUpdated;
        }
        return item;
      });
      setSelectedPool(poolUpdated);
      store.dispatch({
        type: types.SET_INCENTIVIZED_POOLS,
        payload: incentivizedPools_,
      });
      store.dispatch({
        type: types.SET_OSMOSIS_PRICE,
        payload: mintPrice,
      });
      store.dispatch({
        type: types.SET_ALL_POOLS,
        payload: allPools_,
      });
      store.dispatch({
        type: types.SET_TOKEN_BALANCES,
        payload: balancesResponse?.data?.result,
      });
      return false;
    } else {
      return true;
    }
    } else {
      store.dispatch(loadPoolList())
      return false
    }
  }
};


const prepareCreatePool = (swapFee) => {
  const wallet = walletActions.getWalletConstructor();
  if (wallet) {
    const { selectedTokens } = store.getState().pool;
    let transaction = wallet.generateCreatePoolTransaction(
      selectedTokens,
      swapFee
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
          store.dispatch(errorActions.checkErrors(res));
        }
      })
      .catch((err) => {
        store.dispatch(errorActions.checkErrors(err));
      });
  }
};

const prepareExitPoolTransaction = (amounts, shareInAmount) =>  {
    const wallet = walletActions.getWalletConstructor();
    if (wallet) {
      const { pool } = store.getState().pool;
      const { slippageTolerance } = store.getState().swap;
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
            store.dispatch({
              type: types.SET_PREPARE_TRANSFER_RESPONSE,
              payload: res.data,
            });
          } else {
            store.dispatch(errorActions.checkErrors(res));
          }
        })
        .catch((err) => {
          store.dispatch(errorActions.checkErrors(err));
        });
    }
  };

const prepareSuperfluidDelegate = (validator,lockData) => {
  const wallet = walletActions.getWalletConstructor();
  if (wallet) {
    let transaction = wallet.generateSuperfluidDelegateTransaction(validator,lockData);
    wallet
      .prepareTransfer(transaction)
      .then(res => {
        if (res.ok) {
          store.dispatch({
            type: types.SET_PREPARE_TRANSFER_RESPONSE,
            payload: res.data,
          });
        }else{
          store.dispatch(errorActions.checkErrors(res));
        }
      })
      .catch((err) => {
        store.dispatch(errorActions.checkErrors(err));
      });
  }
};

const prepareLockAndDelegateTransaction = (shareInAmount, validator) => {
    const wallet = walletActions.getWalletConstructor();
    if (wallet) {
      const { pool } = store.getState().pool;
      let transaction = wallet.generateLockAndDelegateTransaction(
        pool,
        shareInAmount,
        validator
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
            store.dispatch(errorActions.checkErrors(res));
          }
        })
        .catch((err) => {
          store.dispatch(errorActions.checkErrors(err));
        });
    }
  };
const prepareLockTokensTransaction = (shareInAmount, duration) => {
    const wallet = walletActions.getWalletConstructor();
    if (wallet) {
      const { pool } = store.getState().pool;
      let transaction = wallet.generateLockTokensTransaction(
        pool,
        shareInAmount,
        duration
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
            store.dispatch(errorActions.checkErrors(res));
          }
        })
        .catch((err) => {
          store.dispatch(errorActions.checkErrors(err));
        });
    }
  };

const prepareBeginUnlockTokensTransaction = (duration,isSyntheticLock=false) => {
  const wallet = walletActions.getWalletConstructor();
  if (wallet) {
    let transaction = wallet.generateBeginUnlockTokensTransaction(duration,isSyntheticLock);
    wallet
      .prepareTransfer(transaction)
      .then(res => {
        if (res.ok) {
          store.dispatch({
            type: types.SET_PREPARE_TRANSFER_RESPONSE,
            payload: res.data,
          });
        } else {
          store.dispatch(errorActions.checkErrors(res));
        }
      })
      .catch((err) => {
        store.dispatch(errorActions.checkErrors(err));
      });
  }
};

const prepareJoinPoolTransaction = (amounts, shareOutAmount, singleLp) => {
    const wallet = walletActions.getWalletConstructor();
    const { pool } = store.getState().pool;
    const { slippageTolerance } = store.getState().swap;
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
            store.dispatch({
              type: types.SET_PREPARE_TRANSFER_RESPONSE,
              payload: res.data,
            });
          } else {
            store.dispatch(errorActions.checkErrors(res));
          }
        })
        .catch((err) => {
          store.dispatch(errorActions.checkErrors(err));
        });
    }
  };

export const poolActions = {
  setSelectedPool,
  prepareSuperfluidDelegate,
  setIsSuperfluidLock,
  setSelectedNode,
  setSelectedTokens,
  setPoolMethod,
  getPoolData,
  loadPoolList,
  prepareCreatePool,
  setAmount,
  prepareExitPoolTransaction,
  prepareLockAndDelegateTransaction,
  prepareLockTokensTransaction,
  prepareBeginUnlockTokensTransaction,
  prepareJoinPoolTransaction,
  updatePoolList
}