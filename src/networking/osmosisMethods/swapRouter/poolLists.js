import axios from "axios";
import PoolInfo from './PoolInfo';
import { store } from "../../../store/store";
import { Assets, TokenInfo } from './TokenInfo'
import { Dec } from "@keplr-wallet/unit";
export let poolListResponse = null
export let poolListWithPagination = null
export let swapPools = null

export const getTokenDecimal = (symbol,denom) => {
  const { networks } = store.getState().wallet;
  let decimal = null
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

export const getAllPools = async () => {
    try {
      poolListResponse = await axios.get(
        "https://api-osmosis.imperator.co/pools/v2/all?low_liquidity=true"
      );
      poolListWithPagination = await axios.get(
        "https://lcd-osmosis.keplr.app/osmosis/gamm/v1beta1/pools?pagination.limit=750"
      );
      swapPools = generatePoolList(poolListWithPagination.data?.pools,poolListResponse.data);
      const lastSuccessUpdateTime = new Date();
      return { swapPools: swapPools, lastSuccessUpdateTime };
    } catch(e) {
      setTimeout(async() => await getAllPools(), 5000)
      return { swapPools: swapPools }
    }
  };


const generatePoolList = (pools,poolList) => {
  try{
    let newPools = [];
    pools.forEach((pool) => {
      if(poolList[pool.id]){
        let listOfAssets = []
        poolList[pool.id]?.forEach((asset,i) => {
          let decimal = getTokenDecimal(asset.symbol,asset.denom)
          if(decimal){
            listOfAssets.push(new Assets(new TokenInfo(asset.denom,asset.symbol,asset.price,decimal), new Dec(pool.poolAssets[i].weight).quo(new Dec(pool.totalWeight)), new Dec(pool.poolAssets[i].token.amount).quo(new Dec(Math.pow(10, decimal)))));
          }  
        })
        if(listOfAssets.length === poolList[pool.id].length){
          const poolInfo = new PoolInfo({ ...pool, totalWeight: poolList[pool.id][0]?.liquidity,listOfAssets});
          newPools.push(poolInfo);
        }   
      } 
    });
    return newPools;
  }
  catch(e){
    return swapPools
  }
};
  

export const getDenomByCode = (code) => {
  try{
    let keys = Object.keys(poolListResponse?.data);
    let denom = "";
    for (let i = 0; i < keys.length; i++) {
      if (poolListResponse?.data[keys[i]][0].symbol === code) {
        denom = poolListResponse?.data[keys[i]][0].denom;
        break;
      } else if (poolListResponse?.data[keys[i]][1].symbol === code) {
        denom = poolListResponse?.data[keys[i]][1].denom;
        break;
      }
    }
    return denom;
  }catch{}
  };