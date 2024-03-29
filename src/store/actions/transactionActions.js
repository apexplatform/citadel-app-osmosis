import { types } from './types';
import { walletActions, errorActions } from '.';
import { store } from '../store';

const setOpenedTransaction = (flag) => {
    store.dispatch({
        type: types.SET_OPENED_TRANSACTION,
        payload: flag,
    });
};

const loadTransactions = (page = 1) => async (dispatch) => {
    dispatch({
        type: types.SET_TRANSACTIONS_LOADED,
        payload: false,
    });
    dispatch({
        type: types.SET_TRANSACTIONS_LIST,
        payload: [],
    });
    const activeWallet = store.getState().wallet.activeWallet;
    if (activeWallet) {
        const wallet = walletActions.getWalletConstructor(activeWallet);
        wallet.getTransactions(page).then(response => {
            dispatch({
                type: types.SET_TRANSACTIONS_LIST,
                payload: response?.data,
            });
            dispatch({
                type: types.SET_TRANSACTIONS_LOADED,
                payload: true,
            });
        }).catch(e => {
            dispatch(errorActions.checkErrors(e));
        });
    }
};

export const transactionActions = {
    setOpenedTransaction,
    loadTransactions,
};