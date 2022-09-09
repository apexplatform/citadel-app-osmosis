import { types } from "../actions/types";

const initialState = {
    tokenIn: null,
    tokenOut: null,
    rate: 0,
    initialRate: 1,
    slippage: 0,
    rateAmount: 0,
    slippageTolerance: 1,
    swapStatus: "enterAmount",
    independentField: "INPUT",
    outAmout: 0,
    swapFee: 0,
    fromUSD: 0,
    toUSD: 0,
    isExactIn: true,
    disableSwap: false,
    swapInfo: null,
    amount: 0,
    selectedToken: 'INPUT',
    routes: null
  };
  export default function SwapReducer (state = initialState, action) {
    switch (action.type) {
      case types.SET_SWAP_ROUTE:
        return {
          ...state,
          routes: action.payload,
        };
      case types.SET_EXACT_IN:
        return {
          ...state,
          isExactIn: action.payload,
        };
      case types.SET_AMOUNT:
        return {
            ...state,
            amount: action.payload,
        };
      case types.SET_SELECTED_TOKEN:
        return {
          ...state,
          selectedToken: action.payload,
        };
      case types.SET_DISABLE_SWAP:
        return {
          ...state,
          disableSwap: action.payload,
        };
      case types.SET_FROM_USD_PRICE:
        return {
          ...state,
          fromUSD: action.payload,
        };
      case types.SET_TO_USD_PRICE:
        return {
          ...state,
          toUSD: action.payload,
        };
      case types.SET_SWAP_FEE:
        return {
          ...state,
          swapFee: action.payload,
        };
      case types.SET_OUT_AMOUNT:
        return {
          ...state,
          outAmout: action.payload,
        };
      case types.SET_SWAP_STATUS:
        return {
          ...state,
          swapStatus: action.payload,
        };
      case types.SET_FIELD:
        return {
          ...state,
          independentField: action.payload,
        };
      case types.SET_RATE_AMOUT:
        return {
          ...state,
          rateAmount: action.payload,
        };
      case types.SET_SLIPPAGE_TOLERANCE:
        return {
          ...state,
          slippageTolerance: action.payload,
        };
      case types.SET_INITIAL_RATE:
        return {
          ...state,
          initialRate: action.payload,
        };
      case types.SET_TOKEN_IN:
        return {
          ...state,
          tokenIn: action.payload,
        };
      case types.SET_TOKEN_OUT:
        return {
          ...state,
          tokenOut: action.payload,
        };
      case types.SET_SWAP_RATE:
        return {
          ...state,
          rate: action.payload,
        };
      case types.SET_SLIPPAGE:
        return {
          ...state,
          slippage: action.payload,
        };
      default:
        return state;
    }
  }
  