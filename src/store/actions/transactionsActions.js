import {
  SET_TRANSACTIONS_LOADED,
  SET_OPENED_TRANSACTION,
  SET_TRANSACTIONS_LIST,
  SET_TRANSACTIONS_CLEAR,
} from "./types";
import { getWalletConstructor } from "./walletActions";
import { setLoader } from "./panelActions";
export const setSelectedTransaction = (transaction) => (dispatch) => {
  dispatch({
    type: SET_OPENED_TRANSACTION,
    payload: transaction,
  });
};

export const loadTransactions =
  (limit = 10, offset = 0) =>
  async (dispatch) => {
    const wallet = getWalletConstructor();
    if (wallet) {
      if (offset == 0) {
        dispatch({
          type: SET_TRANSACTIONS_CLEAR,
          payload: [],
        });
        dispatch({
          type: SET_TRANSACTIONS_LOADED,
          payload: true,
        });
      }
      const transactions = await wallet.getTransactions(limit, offset);
      dispatch({
        type: SET_TRANSACTIONS_LIST,
        payload: transactions?.data?.list,
      });
      if (transactions?.data?.list.length < 10) {
        dispatch({
          type: SET_TRANSACTIONS_LOADED,
          payload: false,
        });
      }
      dispatch(setLoader(true));
    }
  };
