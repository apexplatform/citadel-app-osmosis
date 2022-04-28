import {
  SET_USD_PRICES,
  SET_CURRENT_WALLET,
  SET_TOKEN_LIST,
  SET_TOKEN,
  SET_TO_ADDRESS,
  SET_AMOUNT,
  SET_NETWORKS,
  SET_FROM_TOKEN,
  SET_TO_TOKEN,
  SET_FROM_AMOUNT,
  SET_TO_AMOUNT,
  SET_WALLETS,
  SET_PREPARE_TRANSFER_RESPONSE,
  SET_SIGNED_MESSAGE
} from "../actions/types";
const initialState = {
  currentWallet: null,
  currentToken: null,
  wallets: null,
  toAddress: null,
  amount: 0,
  tokens: null,
  tokenList: null,
  fromToken: null,
  toToken: null,
  fromTokenAmount: 0,
  toTokenAmount: 0,
  usdPrices: null,
  transactionResponse: null,
  signedMessage: null
};
export default function (state = initialState, action) {
  switch (action.type) {
    case SET_CURRENT_WALLET:
      return {
        ...state,
        currentWallet: action.payload,
      };
    case SET_SIGNED_MESSAGE:
      return {
        ...state,
        signedMessage: action.payload,
      };
    case SET_PREPARE_TRANSFER_RESPONSE:
      return {
        ...state,
        transactionResponse: action.payload,
      };
    case SET_USD_PRICES:
      return {
        ...state,
        usdPrices: action.payload,
      };
    case SET_TOKEN_LIST:
      return {
        ...state,
        tokenList: action.payload,
      };
    case SET_WALLETS:
      return {
        ...state,
        wallets: action.payload,
      };
    case SET_TOKEN:
      return {
        ...state,
        currentToken: action.payload,
      };
    case SET_TO_ADDRESS:
      return {
        ...state,
        toAddress: action.payload,
      };
    case SET_AMOUNT:
      return {
        ...state,
        amount: action.payload,
      };
    case SET_NETWORKS:
      return {
        ...state,
        tokens: action.payload,
      };
    case SET_FROM_TOKEN:
      return {
        ...state,
        fromToken: action.payload,
      };
    case SET_TO_TOKEN:
      return {
        ...state,
        toToken: action.payload,
      };
    case SET_FROM_AMOUNT:
      return {
        ...state,
        fromTokenAmount: action.payload,
      };
    case SET_TO_AMOUNT:
      return {
        ...state,
        toTokenAmount: action.payload,
      };
    default:
      return state;
  }
}
