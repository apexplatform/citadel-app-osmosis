import PoolInfo from './PoolInfo';
import { store } from "../../../store/store";
import { Assets, TokenInfo } from './TokenInfo'
import { Dec } from "@keplr-wallet/unit";
import { getResponse } from '../utils/rm';
import { errorActions } from '../../../store/actions'
export let poolListResponse = null
export let poolListWithPagination = null
export let swapPools = []

export const getTokenDecimal = (symbol,denom) => {
  const { networks } = store.getState().wallet;
  let decimal = 6
  if(denom.includes('gamm')){
    return 18
  }
  if(symbol === 'OSMO'){
    return 6
  }
  let osmosisToken = networks?.osmosis;
    if (osmosisToken) {
      let keys = Object.keys(osmosisToken?.tokens);
      keys.forEach(net => {
        if((osmosisToken.tokens[net].code === symbol) || (osmosisToken.tokens[net]?.fullDenom === denom)){
          decimal = +osmosisToken?.tokens[net].decimals;
        }
      })
    }
  return decimal
}

export const getAllPools = async (attempt = 0) => {
    try {
      poolListResponse = await getResponse(
        "https://api-osmosis.imperator.co/pools/v2/all?low_liquidity=true"
      );
      poolListWithPagination = await getResponse(
        "https://lcd-osmosis.keplr.app/osmosis/gamm/v1beta1/pools?pagination.limit=1000"
      );
      swapPools = generatePoolList(poolListWithPagination?.pools,poolListResponse);
      return { swapPools };
    } catch(e) {
      attempt++
      if(attempt <= 2){
        setTimeout(async() => await getAllPools(attempt), 3000)
      }else{
        store.dispatch(errorActions.checkErrors({message: "We cannot access pool information for the optimal routing at the moment. Restart the app and if the issue persists, try again later."}));
      }
      return { swapPools: swapPools }
    }
  };


const generatePoolList = (pools,poolList) => {
  try{
    let newPools = [];
    pools.forEach((pool) => {
      if(poolList[+pool.id].length && pool?.pool_assets){
        let list_of_assets = [] 
        poolList[+pool.id]?.forEach((asset,i) => {
          let decimal = getTokenDecimal(asset.symbol,asset.denom)
          if(decimal){
            list_of_assets.push(new Assets(
              new TokenInfo(asset?.denom,asset?.symbol,asset?.price,decimal), 
              new Dec(pool?.pool_assets[i]?.weight).quo(new Dec(pool?.total_weight)), 
              new Dec(pool?.pool_assets[i]?.token?.amount).quo(new Dec(Math.pow(10, decimal))),
              pool?.pool_assets[i]
              ));
          }  
        })
        if(list_of_assets.length === poolList[+pool.id].length){
          const poolInfo = new PoolInfo({ ...pool, total_weight: poolList[+pool.id][0]?.liquidity,list_of_assets});
          newPools.push(poolInfo);
        }   
      } 
    });
    return newPools;
  }
  catch(e){
    console.log(e);
    return swapPools
  }
};
  

export const getDenomByCode = (code) => {
  try{
    let keys = Object.keys(poolListResponse);
    let denom = "";
    for (let i = 0; i < keys.length; i++) {
      if (poolListResponse[keys[i]][0].symbol === code) {
        denom = poolListResponse[keys[i]][0].denom;
        break;
      } else if (poolListResponse[keys[i]][1].symbol === code) {
        denom = poolListResponse[keys[i]][1].denom;
        break;
      }
    }
    return denom;
  }catch{}
  };