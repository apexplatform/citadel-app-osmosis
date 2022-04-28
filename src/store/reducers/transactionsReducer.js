import {
  SET_TRANSACTIONS_CLEAR,
  SET_OPENED_TRANSACTION,
  SET_TRANSACTIONS_LIST,
  SET_TRANSACTIONS_LOADED,
} from "../actions/types";

const initialState = {
  openedTransaction: [],
  transactions: [],
  hasmoreTransactions: true,
};
export default function (state = initialState, action) {
  switch (action.type) {
    case SET_OPENED_TRANSACTION:
      return {
        ...state,
        openedTransaction: action.payload,
      };
    case SET_TRANSACTIONS_LIST:
      return {
        ...state,
        transactions: state.transactions.concat(action.payload),
      };
    case SET_TRANSACTIONS_CLEAR:
      return {
        ...state,
        transactions: action.payload,
      };
    case SET_TRANSACTIONS_LOADED:
      return {
        ...state,
        hasmoreTransactions: action.payload,
      };
    default:
      return state;
  }
}
