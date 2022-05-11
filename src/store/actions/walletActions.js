import {
  SET_USD_PRICES,
  SET_PREPARE_TRANSFER_RESPONSE,
  SET_TOKEN_BALANCES,
  SET_INCENTIVIZED_POOLS,
  SET_ALL_POOLS,
  SET_TOKEN_LIST,
  SET_WALLETS,
  SET_AMOUNT,
  SET_FROM_TOKEN,
  SET_TO_TOKEN,
  SET_FROM_AMOUNT,
  SET_TO_AMOUNT,
  SET_TO_ADDRESS,
  SET_CURRENT_WALLET,
  SET_TOKEN,
  SET_NETWORKS,
  SET_STAKE_NODES,
  SET_SUPERFLUID_DELEGATIONS
} from "./types";
import models from "../../networking/models";
import store from "../store";
import { checkErrors } from "./errorsActions";
import { ValidationError } from "../../networking/models/Errors";
import axios from "axios";
import ROUTES from "../../routes";
import { setSwapDisable } from "./swapActions";
import { WalletList } from "../../networking/models/WalletList";
import { setLoader, setPreviosPanel, setActivePage } from "./panelActions";
import { loadTransactions } from "./transactionsActions";
import { loadPoolList, setSelectedTokens, setSelectedPool } from "./poolActions";
import { logos } from "../../networking/osmosisMethods/osmosis-logo";
export const setCurrentWallet = (wallet) => (dispatch) => {
  dispatch({
    type: SET_CURRENT_WALLET,
    payload: wallet,
  });
  const { pool } = store.getState().poolReducer;
  dispatch(loadTokenWithBalances());
  dispatch(setLoader(false));
  dispatch(loadTransactions(10, 0));
  dispatch(setSelectedPool(pool));
  dispatch(setActivePage(ROUTES.POOL_DETAILS));
  dispatch({
    type: SET_INCENTIVIZED_POOLS,
    payload: null,
  });
  dispatch({
    type: SET_ALL_POOLS,
    payload: null,
  });
  dispatch({
    type: SET_TOKEN_BALANCES,
    payload: null,
  });
  dispatch({
    type: SET_SUPERFLUID_DELEGATIONS,
    payload: null,
  });
  dispatch(loadPoolList());
  dispatch(setSelectedTokens(null));
  dispatch(setLoader(true));
};

export const setToAddress = (address) => (dispatch) => {
  dispatch({
    type: SET_TO_ADDRESS,
    payload: address,
  });
};

export const setAmount = (amount) => (dispatch) => {
  dispatch(setSwapDisable(false));
  dispatch({
    type: SET_AMOUNT,
    payload: amount,
  });
};

export const setSelectedToken = (token) => (dispatch) => {
  dispatch(setSwapDisable(false));
  dispatch(setPreviosPanel(ROUTES.HOME));
  if (token === "from") dispatch(loadTokenWithBalances());
  dispatch({
    type: SET_TOKEN,
    payload: token,
  });
};

export const setFromToken = (token) => (dispatch) => {
  dispatch({
    type: SET_FROM_TOKEN,
    payload: token,
  });
};

export const setToToken = (token) => (dispatch) => {
  dispatch({
    type: SET_TO_TOKEN,
    payload: token,
  });
};

export const setFromAmount = (amount) => (dispatch) => {
  dispatch({
    type: SET_FROM_AMOUNT,
    payload: amount,
  });
};

export const setToAmount = (amount) => (dispatch) => {
  dispatch({
    type: SET_TO_AMOUNT,
    payload: amount,
  });
};
export const getCurrentWallet = () => {
  const { currentWallet } = store.getState().walletReducer;
  return currentWallet;
};

export const getWalletConstructor = (address) => {
  try {
    const currentWallet = address || getCurrentWallet();
    const WalletConstructor = models[currentWallet.network.toUpperCase()];
    const wallet = new WalletConstructor(currentWallet);
    return wallet;
  } catch {
    new Error("Wallet doesn't exists ");
  }
};


export const prepareTransfer = () => (dispatch) => {
  const wallet = getWalletConstructor();
  const transaction = wallet.generateBaseTransaction();
  wallet
    .prepareTransfer(transaction)
    .then((ok, data) => {
      if (ok) {
        return dispatch({
          type: SET_PREPARE_TRANSFER_RESPONSE,
          payload: data,
        });
      } else {
        dispatch(checkErrors(data));
      }
    })
    .catch((err) => {
      dispatch(checkErrors(err));
    });
};


export const loadNetworks = () => (dispatch) => {
  try {
    axios.get(process.env.REACT_APP_BACKEND_URL_2 + "/api/networks.json").then((res) =>
      dispatch({
        type: SET_NETWORKS,
        payload: res.data,
      })
    );
    axios
      .get(
        "https://api.coingecko.com/api/v3/simple/price?ids=stargaze&vs_currencies=usd"
      )
      .then((res) =>
        dispatch({
          type: SET_USD_PRICES,
          payload: res.data,
        })
      );
  } catch(e) {}
};

export const loadStakeNodes = () => (dispatch) => {
  try {
    axios.get(process.env.REACT_APP_BACKEND_URL_2 + "/api/staking-node?version=1.0.4").then((res) => {
      dispatch({
        type: SET_STAKE_NODES,
        payload: res.data.data?.osmosis,
      })
    });
  } catch {}
};

export const loadTokenWithBalances = (count=3) => async (dispatch) => {
  try {
    const wallet = getWalletConstructor();
    const res = await wallet.getTokenBalance();
    const keys = res.data ? Object.keys(res.data) : [];
    const { currentWallet, tokens, fromToken, toToken } = store.getState().walletReducer;
    let osmosisToken = tokens?.osmosis;
    if (osmosisToken) {
      let keys2 = Object.keys(osmosisToken?.tokens);
      let tokenList = [];
      let osmosis = {
        net: "osmosis",
        code: "OSMO",
        decimals: "6",
        denom: "uosmo",
        name: "Osmosis",
        logoURI: "img/tokens/osmosis.svg",
        balance: currentWallet?.balance?.mainBalance || 0,
      };
      tokenList.push(osmosis);
      keys2.map((elem) => {
        osmosisToken.tokens[elem].balance = 0;
        osmosisToken.tokens[elem].name = osmosisToken.tokens[elem].name.replace(
          "IBC ",
          ""
        );
        osmosisToken.tokens[elem].logoURI =
          logos[elem]?.logoURI || "img/icons/unsupported.svg";
        tokenList.push(osmosisToken.tokens[elem]);
      });
      keys?.map((net) => {
        tokenList.map((token, i) => {
          if (token.net == net) {
            tokenList[i].balance = res.data[net].amount;
            tokenList[i].USD = res.data[net].price?.USD;
          }
          if (fromToken?.code == tokenList[i].code) {
            fromToken.balance = tokenList[i].balance;
          } else if (toToken?.code == tokenList[i].code) {
            toToken.balance = tokenList[i].balance;
          }
        });
      });
      dispatch({
        type: SET_FROM_TOKEN,
        payload: !fromToken ? tokenList[0] : fromToken,
      });
      dispatch({
        type: SET_TO_TOKEN,
        payload: !toToken ? tokenList.find(token => token.code == 'ATOM') : toToken,
      });
      dispatch({
        type: SET_TOKEN_LIST,
        payload: tokenList,
      });
    } else {
       if(count>0){
       dispatch(loadTokenWithBalances(count-1));
      }
    }
  } catch (err) {
    dispatch(checkErrors(err));
  }
};
export const loadWalletWithBalances = (action) => (dispatch) => {
  try {
    const walletList = new WalletList();
    const wallets = walletList.loadWalletsWithBalances(action);
    if (wallets instanceof ValidationError) {
      dispatch(checkErrors(wallets));
      return;
    }
    if (wallets.length) {
      dispatch({
        type: SET_CURRENT_WALLET,
        payload: wallets[0],
      });
      dispatch({
        type: SET_WALLETS,
        payload: wallets,
      });
    }
    dispatch(setLoader(true));
  } catch {}
};

export const updateCurrentTokens = () => async (dispatch) => {
  try {
    const wallet = getWalletConstructor();
    const res = await wallet.getTokenBalance();
    const { fromToken, toToken, currentWallet } =
      store.getState().walletReducer;
    const keys = res.data ? Object.keys(res.data) : [];
    if (keys.includes(fromToken.net)) {
      if (res.data[fromToken.net].amount == fromToken.balance) {
        return true;
      } else {
        fromToken.balance = res.data[fromToken.net]?.amount;
        dispatch({
          type: SET_FROM_TOKEN,
          payload: fromToken,
        });
      }
    }
    if (keys.includes(toToken.net)) {
      if (res.data[toToken.net].amount == toToken.balance) {
        return true;
      } else {
        toToken.balance = res.data[toToken.net]?.amount;
        dispatch({
          type: SET_TO_TOKEN,
          payload: toToken,
        });
      }
    }
    if (fromToken.code == currentWallet.code) {
      let response = await wallet.getWalletBalance();
      if (response.ok) {
        if (response.data.mainBalance == fromToken.balance) {
          return true;
        } else {
          fromToken.balance = response.data;
          dispatch({
            type: SET_FROM_TOKEN,
            payload: fromToken,
          });
          currentWallet.balance = response.data;
          dispatch({
            type: SET_CURRENT_WALLET,
            payload: currentWallet,
          });
        }
      }
    }
    if (toToken.code == currentWallet.code) {
      let response = await wallet.getWalletBalance();
      if (response.ok) {
        if (response.data.mainBalance == toToken.balance) {
          return true;
        } else {
          toToken.balance = response.data;
          dispatch({
            type: SET_TO_TOKEN,
            payload: toToken,
          });
          currentWallet.balance = response.data;
          dispatch({
            type: SET_CURRENT_WALLET,
            payload: currentWallet,
          });
        }
      }
    }
    return false;
  } catch {}
};

