import {
  SET_SWAP_STATUS,
  SET_DISABLE_SWAP,
  SET_SWAP_FEE,
  SET_FIELD,
  SET_POOL_INFO,
  SET_TOKEN_IN,
  SET_TOKEN_OUT,
  SET_SWAP_RATE,
  SET_SLIPPAGE,
  SET_POOL_ID,
  SET_INITIAL_RATE,
  SET_RATE_AMOUT,
  SET_SLIPPAGE_TOLERANCE,
  SET_OUT_AMOUNT,
  SET_FROM_USD_PRICE,
  SET_TO_USD_PRICE,
  SET_POOLS_LIST,
  SET_SWAP_INFO
} from "../actions/types";
const initialState = {
  poolInfo: null,
  tokenIn: {},
  tokenOut: {},
  rate: null,
  initialRate: 1,
  slippage: 0,
  poolId: 1,
  rateAmount: 0,
  slippageTolerance: 5,
  swapStatus: "enterAmount",
  independentField: "INPUT",
  outAmout: 0,
  swapFee: 0,
  fromUSD: 0,
  toUSD: 0,
  disableSwap: false,
  swapPools: null,
  swapInfo: null
};
export default function (state = initialState, action) {
  switch (action.type) {
    case SET_POOL_INFO:
      return {
        ...state,
        poolInfo: action.payload,
      };
    case SET_SWAP_INFO:
      return {
        ...state,
        swapInfo: action.payload,
      };
    case SET_POOLS_LIST:
      return {
        ...state,
        swapPools: action.payload,
      };
    case SET_DISABLE_SWAP:
      return {
        ...state,
        disableSwap: action.payload,
      };
    case SET_FROM_USD_PRICE:
      return {
        ...state,
        fromUSD: action.payload,
      };
    case SET_TO_USD_PRICE:
      return {
        ...state,
        toUSD: action.payload,
      };
    case SET_SWAP_FEE:
      return {
        ...state,
        swapFee: action.payload,
      };
    case SET_OUT_AMOUNT:
      return {
        ...state,
        outAmout: action.payload,
      };
    case SET_SWAP_STATUS:
      return {
        ...state,
        swapStatus: action.payload,
      };
    case SET_FIELD:
      return {
        ...state,
        independentField: action.payload,
      };
    case SET_RATE_AMOUT:
      return {
        ...state,
        rateAmount: action.payload,
      };
    case SET_SLIPPAGE_TOLERANCE:
      return {
        ...state,
        slippageTolerance: action.payload,
      };
    case SET_INITIAL_RATE:
      return {
        ...state,
        initialRate: action.payload,
      };
    case SET_POOL_ID:
      return {
        ...state,
        poolId: action.payload,
      };
    case SET_TOKEN_IN:
      return {
        ...state,
        tokenIn: action.payload,
      };
    case SET_TOKEN_OUT:
      return {
        ...state,
        tokenOut: action.payload,
      };
    case SET_SWAP_RATE:
      return {
        ...state,
        rate: action.payload,
      };
    case SET_SLIPPAGE:
      return {
        ...state,
        slippage: action.payload,
      };
    default:
      return state;
  }
}
