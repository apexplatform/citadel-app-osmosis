import { types } from "../actions/types";
  const initialState = {
    poolInfo: null,
    poolId: 1,
    swapPools: null,
    pool: {},
    liquidityMethod: "add",
    incentivizedPools: null,
    allPools: null,
    tokenBalances: null,
    selectedTokens: [],
    superfluidDelegations: null,
    selectedValidator: null,
    amount: 0,
    isSuperfluidLock: false
  };
  export default function SwapReducer (state = initialState, action) {
    switch (action.type) {
      case types.SET_POOL_INFO:
        return {
          ...state,
          poolInfo: action.payload,
        };
      case types.SET_IS_SUPERFLIUD:
        return {
          ...state,
          isSuperfluidLock: action.payload,
        };
      case types.SET_POOL_AMOUNT:
        return {
          ...state,
          amount: action.payload,
        };
      case types.SET_SELECTED_NODE:
        return {
          ...state,
          selectedValidator: action.payload,
        };
      case types.SET_SUPERFLUID_DELEGATIONS:
        return {
          ...state,
          superfluidDelegations: action.payload,
        };
      case types.SET_SELECTED_TOKENS:
        return {
          ...state,
          selectedTokens: action.payload,
        };
      case types.SET_POOLS_LIST:
        return {
          ...state,
          swapPools: action.payload,
        };
      case types.SET_POOL_ID:
        return {
          ...state,
          poolId: action.payload,
        };
      case types.SET_OPENED_POOL:
        return {
          ...state,
          pool: action.payload,
        };
      case types.SET_INCENTIVIZED_POOLS:
        return {
          ...state,
          incentivizedPools: action.payload,
        };
      case types.SET_TOKEN_BALANCES:
        return {
          ...state,
          tokenBalances: action.payload,
        };
      case types.SET_ALL_POOLS:
        return {
          ...state,
          allPools: action.payload,
        };
      case types.SET_LIQUIDITY_METHOD:
        return {
          ...state,
          liquidityMethod: action.payload,
        };
      default:
        return state;
    }
  }
  