import {
  SET_OPENED_POOL,
  SET_SELECTED_TOKENS,
  SET_TOKEN_BALANCES,
  SET_INCENTIVIZED_POOLS,
  SET_ALL_POOLS,
  SET_LIQUIDITY_METHOD,
  SET_OSMOSIS_PRICE,
  SET_STAKE_NODES,
  SET_SUPERFLUID_DELEGATIONS,
  SET_SELECTED_NODE,
  SET_IS_SUPERFLIUD
} from "../actions/types";

const initialState = {
  pool: {},
  liquidityMethod: "add",
  incentivizedPools: null,
  allPools: null,
  tokenBalances: null,
  selectedTokens: [],
  osmoPrice: null,
  stakeNodes: null,
  superfluidDelegations: null,
  selectedNode: null,
  isSuperfluidLock: false
};
export default function (state = initialState, action) {
  switch (action.type) {
    case SET_OPENED_POOL:
      return {
        ...state,
        pool: action.payload,
      };
    case SET_IS_SUPERFLIUD:
        return {
          ...state,
          isSuperfluidLock: action.payload,
        };
    case SET_SELECTED_NODE:
      return {
        ...state,
        selectedNode: action.payload,
      };
    case SET_SUPERFLUID_DELEGATIONS:
      return {
        ...state,
        superfluidDelegations: action.payload,
      };
    case SET_STAKE_NODES:
      return {
        ...state,
        stakeNodes: action.payload,
      };
    case SET_SELECTED_TOKENS:
      return {
        ...state,
        selectedTokens: action.payload,
      };
    case SET_OSMOSIS_PRICE:
      return {
        ...state,
        osmoPrice: action.payload,
      };
    case SET_INCENTIVIZED_POOLS:
      return {
        ...state,
        incentivizedPools: action.payload,
      };
    case SET_TOKEN_BALANCES:
      return {
        ...state,
        tokenBalances: action.payload,
      };
    case SET_ALL_POOLS:
      return {
        ...state,
        allPools: action.payload,
      };
    case SET_LIQUIDITY_METHOD:
      return {
        ...state,
        liquidityMethod: action.payload,
      };
    default:
      return state;
  }
}
