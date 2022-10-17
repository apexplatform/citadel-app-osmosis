import axios from "axios";
import { CoinPretty, Coin, Dec, DecUtils, Int, IntPretty } from "@keplr-wallet/unit";
import { PricePretty } from "@keplr-wallet/unit/build/price-pretty";
import dayjs from "dayjs";
import { calcPoolOutGivenSingleIn } from "./utils/math";
import { store } from "../../store/store";
import { fiatCurrency, mintCurrency, poolInfoList } from './constans'
import { poolListResponse, poolListWithPagination } from './swapRouter/poolLists';
import { formatPoolName } from '../../components/helpers/addressFormatter';
import { denoms } from './stores/pools';

let duration = require("dayjs/plugin/duration");
dayjs.extend(duration);
let incentivizedPoolIds = [];
let durations = null;
let incentivizedPoolsResponse = null;
let epochResponse = null;
let distrResponse = null;
let epochProvisions = null;
let incentivizedPools = [];
let paramsResponse = null;
let mintPrice = null;
let balancesResponse = null;
let lockedResponse = null;
let allPools = null;
let locksResponse = null;
let superfluidDelegations = null;
let minimumRiskFactor = null;
let allAssets = null
let apr_staking = null

export const getPoolTokenInfo = (code, symbol = "", pool, id) => {
  let result = {
    coinDenom: symbol,
    coinMinimalDenom: null,
    coinDecimals: 6,
    coinGeckoId: code,
    coinImageUrl: "img/tokens/unsupported.svg",
  };
  poolInfoList.forEach((pool) => {
    if (
      pool.coinDenom.toLowerCase() === code.toLowerCase() ||
      pool.coinGeckoId.toLowerCase() === code.toLowerCase()
    ) {
      result = pool;
    } else if (pool.coinDenom.toLowerCase() === symbol.toLowerCase()) {
      result = pool;
    }
  });
  if(pool && id){
    if(pool.symbol.length > 0){
      result.symbol = pool.symbol
    }else if(pool.denom.includes('gamm/pool/')){
      result.symbol = pool.denom.replace('gamm/pool/', 'GAMM-')
    } else {
      let item = denoms.find(elem => elem.denom === pool.denom)
      if(item){
        result.symbol = formatPoolName(item.symbol,8)
      } else {
        result.symbol = formatPoolName(pool.denom,8) 
      }
    }
  }
  return result;
};


export const getDenomByCode = (code) => {
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
};


export const getGammInfo = (id) => {
  return {
    coinDecimals: 18,
    coinDenom: `GAMM-${id}`,
    coinMinimalDenom: `gamm/pool/${id}`,
  };
};


const getPoolFromPagination = (response, id) => {
  if (!response) {
    return undefined;
  }
  const pool = response.find((pool) => +pool.id === +id);
  if (!pool) {
    return undefined;
  }
  return pool;
};

export const calculateOsmoEquivalent = async(coinPretty,id) => {
  const multiplier = await calculateOsmoEquivalentMultiplier(coinPretty.currency,id);
  const stakeCurrency = getPoolTokenInfo('osmo');
  let amount = new CoinPretty(
    stakeCurrency,
    coinPretty.mul(multiplier).mul(DecUtils.getTenExponentN(stakeCurrency.coinDecimals))
  );
  amount._options.hideDenom = true;
  return amount?.maxDecimals(3).toString()
}

export const calculateOsmoEquivalentMultiplier = async(currency,id) => {
  const minimumRiskFactorDec = new Dec(minimumRiskFactor.data.params.minimum_risk_factor);
  const assetMultiplier = await axios.get("https://lcd-osmosis.keplr.app/osmosis/superfluid/v1beta1/asset_multiplier?denom=gamm/pool/"+id);
  const assetMultiplierDec = new Dec(assetMultiplier.data.osmo_equivalent_multiplier.multiplier)
  const osmoCurrency = getPoolTokenInfo('osmo');
  const multipication = DecUtils.getTenExponentN(currency.coinDecimals - osmoCurrency.coinDecimals);
  return assetMultiplierDec.mul(new Dec(1).sub(minimumRiskFactorDec)).mul(multipication);
}

export const loadPoolData = async() => {
  incentivizedPoolsResponse = await axios.get(
    "https://lcd-osmosis.keplr.app/osmosis/pool-incentives/v1beta1/incentivized_pools"
  );
  minimumRiskFactor = await axios.get(
    "https://lcd-osmosis.keplr.app/osmosis/superfluid/v1beta1/params"
  );
  apr_staking = await axios.get(
    "https://api-osmosis.imperator.co/apr/v2/staking"
  );
  epochResponse = await axios.get(
    "https://lcd-osmosis.keplr.app/osmosis/epochs/v1beta1/epochs"
  );
  epochProvisions = await axios.get(
    "https://lcd-osmosis.keplr.app/osmosis/mint/v1beta1/epoch_provisions"
  );
}

export const getPools = async (address) => {
  try {  
    distrResponse = await axios.get(
      "https://lcd-osmosis.keplr.app/osmosis/pool-incentives/v1beta1/distr_info"
    );
    paramsResponse = await axios.get(
      "https://lcd-osmosis.keplr.app/osmosis/mint/v1beta1/params"
    );
    locksResponse = await axios.get(
      "https://lcd-osmosis.keplr.app/osmosis/lockup/v1beta1/account_locked_longer_duration/" +
        address
    );
    superfluidDelegations = await axios.get(
      "https://lcd-osmosis.keplr.app/osmosis/superfluid/v1beta1/superfluid_delegations/"+address
    );
    allAssets = await axios.get(
      "https://lcd-osmosis.keplr.app/osmosis/superfluid/v1beta1/all_assets"
    );
    durations = await lockableDurations();
    incentivizedPoolIds = [];
    incentivizedPools = [];
    incentivizedPoolsResponse.data?.incentivized_pools?.forEach((item) => {
      if (!incentivizedPoolIds.includes(item.pool_id)) {
        incentivizedPoolIds.push(item.pool_id);
      }
    });
    const lockedCoins = await getOwnPools(address);
    if(poolListWithPagination?.data){
      allPools = generatePoolList(
        poolListWithPagination?.data?.pools,
        lockedCoins
      );
      incentivizedPoolIds.forEach((id) => {
        allPools?.forEach((pool) => {
          if (id === pool.id) {
            pool.isIncentivized = true;
            incentivizedPools.push(pool);
          }
        });
      });
    }else{
      return { status: false, data: {}}
    }
    
    return { status: true, data: { incentivizedPools: incentivizedPools, mintPrice, allPools, balancesResponse, superfluidDelegations: superfluidDelegations.data }};
  } catch(e) {
    console.log(e)
    return { status: false, data: {}}
  }
};

export const checkSuperfluidPool = (poolId) => {
  if (!allAssets.data) {
    return false;
  }

  for (const asset of allAssets.data.assets) {
    if (asset.asset_type === 'SuperfluidAssetTypeLPShare' && asset.denom === `gamm/pool/${poolId}`) {
      return true;
    }
  }

  return false;
}

export const getPoolUpdate = async (address, pool) => {
  try {
    let poolListWithPagination = await axios.get(
      "https://lcd-osmosis.keplr.app/osmosis/gamm/v1beta1/pools?pagination.limit=750"
    );
    locksResponse = await axios.get(
      "https://lcd-osmosis.keplr.app/osmosis/lockup/v1beta1/account_locked_longer_duration/" +
        address
    );
    const lockedCoins = await getOwnPools(address);
    const poolUpdated = updatePoolInfo(
      pool,
      poolListWithPagination.data?.pools,
      lockedCoins
    );
    if (incentivizedPoolIds.includes(pool.id)) {
      poolUpdated.isIncentivized = true;
    }
    return { poolUpdated, mintPrice, balancesResponse };
  } catch{}
};

export const estimatePoolAPROsmo = (poolId) => {
    const pool = getPoolFromPagination(poolListWithPagination.data.pools, poolId);
    if (pool) {
      const osmoCurrency = getPoolTokenInfo('osmo');
      const poolAsset = pool.pool_assets.find(
        asset => asset.token.denom === osmoCurrency.coinMinimalDenom
      );
      if (poolAsset && new Dec(pool.totalWeight).gt(new Dec(0)) && apr_staking?.data) {
        const ratio = new Dec(poolAsset.weight).quo(new Dec(pool.totalWeight));
        const minimumRiskFactorDec = new Dec(minimumRiskFactor.data.params.minimum_risk_factor);
        return ratio.mul(new Dec(1).sub(minimumRiskFactorDec)).mul(new Dec(apr_staking?.data)).toString();
      }
    }
    return 0;
  }


const updatePoolInfo = (pool, poolList, lockedCoins) => {
  let poolUpdated = {};
  let foundedPool = poolList.find((item) => item.id === pool.id);
  if (foundedPool) {
    const poolData = {
      ...foundedPool,
      poolInfo: poolListResponse.data?.[foundedPool.id],
    };
   
    const poolCoinInfo = poolData.poolInfo.map((item) => {
      return getPoolTokenInfo(item.coingecko_id, item.symbol, item, pool.id);
    });
    const apr = incentivizedPoolIds.includes(foundedPool.id)
      ? computeAPY(poolData, durations[durations.length - 1]).toString()
      : "";
    const poolTVL = new PricePretty(
      fiatCurrency,
      new Dec(Math.round(poolListResponse.data?.[pool.id][0]?.liquidity))
    );
    let lockDurations = [];
    const lockableDurations = durations.slice().sort((v1, v2) => {
      return v1.asMilliseconds() > v2.asMilliseconds() ? 1 : -1;
    });
    if (incentivizedPoolIds.includes(pool.id)) {
      lockableDurations.forEach((lockableDuration, i) => {
        let apr = computeAPY(poolData, lockableDuration).toString();
        let duration = lockableDuration.asDays();
        let lockup = getLockedCoinWithDuration(poolData, lockableDuration);
        lockup.amount._options.hideDenom = true;
        const lockedShareRatio = getLockedGammShareRatioByDuration(lockup.amount, pool);
        let usdAmount = poolTVL.mul(lockedShareRatio.increasePrecision(2)).toString()
        lockDurations.push({ apr, duration, lockup, lockableDuration, usdAmount });
      });
    }
    const isSuperfluidPool = checkSuperfluidPool(pool.id)
    let superFluidAPR = new Dec(0)
    if(isSuperfluidPool){
      superFluidAPR = estimatePoolAPROsmo(pool.id)
    }
    if (lockedCoins.includes(foundedPool.id)) {
      const shareRatio = getAllGammShareRatio(foundedPool.id);
      const actualShareRatio = shareRatio.increasePrecision(2);
      const lockedShareRatio = getLockedGammShareRatio(foundedPool);
      const gammShare = getAvailableGammShare(foundedPool.id);
      const allGammShare = getAllGammShare(pool.id);
      allGammShare._options.hideDenom = true;
      gammShare._options.hideDenom = true;
      const actualLockedShareRatio = lockedShareRatio.increasePrecision(2);
      const availableLP = getAvailableLPTokens(poolData);
      let myAmounts = [];
      foundedPool.pool_assets.forEach((item, i) => {
        const dec = new CoinPretty(
          poolCoinInfo[i],
          new Dec(item?.token?.amount)
        );
        const amount = dec.mul(actualShareRatio).trim(true).shrink(true);
        amount._options.hideDenom = true;
        myAmounts.push(amount.toString());
      });
      let unlockingDatas = [];
      for (const lockableDuration of lockableDurations) {
        const unlockings = getUnlockingCoinWithDuration(
          getGammInfo(foundedPool.id),
          lockableDuration
        );
        unlockingDatas = unlockingDatas.concat(
          unlockings.map((unlocking) => {
            return {
              ...unlocking,
              ...{
                duration: lockableDuration,
              },
            };
          })
        );
      }
      poolUpdated = {
        ...poolData,
        allGammShare,
        unlockingDatas,
        gammShare: gammShare,
        poolCoinInfo,
        poolTVL: poolTVL,
        availableLP,
        isSuperfluidPool,
        superFluidAPR,
        lockDurations,
        myLiquidity: poolTVL.mul(actualShareRatio).toString(),
        myAmounts,
        myLockedAmount: incentivizedPoolIds.includes(pool.id)
          ? poolTVL.mul(actualLockedShareRatio).toString()
          : undefined,
        apr,
      };
    } else {
      poolUpdated = {
        ...poolData,
        allGammShare: null,
        unlockingDatas: null,
        gammShare: null,
        poolCoinInfo,
        poolTVL: poolTVL,
        lockDurations,
        isSuperfluidPool,
        availableLP: "$0",
        superFluidAPR, 
        myLiquidity: 0,
        myLockedAmount: 0,
        apr,
      };
    }
  }
  return poolUpdated;
};


const generatePoolList = (pools, lockedCoins) => {
  let newPools = [];
  pools?.forEach((pool) => {
 
    const poolData = { ...pool, poolInfo: poolListResponse.data?.[pool.id] };
    const poolCoinInfo = poolData.poolInfo.map((item) => {
      return getPoolTokenInfo(item.coingecko_id, item.symbol, item, pool.id);
    });
    const apr = incentivizedPoolIds.includes(pool.id)
      ? computeAPY(poolData, durations[durations.length - 1]).toString()
      : "";
    const poolTVL = new PricePretty(
      fiatCurrency,
      new Dec(Math.round(poolListResponse.data?.[pool.id][0]?.liquidity))
    );
    let lockDurations = [];
    const lockableDurations = durations.slice().sort((v1, v2) => {
      return v1.asMilliseconds() > v2.asMilliseconds() ? 1 : -1;
    });
    if (incentivizedPoolIds.includes(pool.id)) {
      lockableDurations.forEach((lockableDuration) => {
        let apr = computeAPY(poolData, lockableDuration).toString();
        let duration = lockableDuration.asDays();
        let lockup = getLockedCoinWithDuration(poolData, lockableDuration);
        lockup.amount._options.hideDenom = true;
        const lockedShareRatio = getLockedGammShareRatioByDuration(lockup.amount, pool);
        let usdAmount = poolTVL.mul(lockedShareRatio.increasePrecision(2)).toString()
        lockDurations.push({ apr, duration, lockup, lockableDuration, usdAmount });
      });
    }
    const isSuperfluidPool = checkSuperfluidPool(pool.id)
    let superFluidAPR = new Dec(0)
    if(isSuperfluidPool){
      superFluidAPR = estimatePoolAPROsmo(pool.id)
    }
    if (lockedCoins.includes(pool.id)) {
      const shareRatio = getAllGammShareRatio(pool.id);
      const actualShareRatio = shareRatio.increasePrecision(2);
      const lockedShareRatio = getLockedGammShareRatio(pool);
      const gammShare = getAvailableGammShare(pool.id);
      const allGammShare = getAllGammShare(pool.id);
      allGammShare._options.hideDenom = true;
      gammShare._options.hideDenom = true;
      const actualLockedShareRatio = lockedShareRatio.increasePrecision(2);
      const availableLP = getAvailableLPTokens(poolData);
      let myAmounts = [];
      pool.pool_assets?.forEach((item, i) => {
        const dec = new CoinPretty(
          poolCoinInfo[i],
          new Dec(item?.token?.amount)
        );
        const amount = dec.mul(actualShareRatio).trim(true).shrink(true);
        amount._options.hideDenom = true;
        myAmounts.push(amount.toString());
      });
      let unlockingDatas = [];
      for (const lockableDuration of lockableDurations) {
        const unlockings = getUnlockingCoinWithDuration(
          getGammInfo(pool.id),
          lockableDuration
        );
        unlockingDatas = unlockingDatas.concat(
          unlockings.map((unlocking) => {
            return {
              ...unlocking,
              ...{
                duration: lockableDuration,
              },
            };
          })
        );
      }
      newPools.push({
        ...poolData,
        allGammShare,
        unlockingDatas,
        gammShare: gammShare,
        poolCoinInfo,
        poolTVL: poolTVL,
        availableLP,
        lockDurations,
        superFluidAPR,
        actualShareRatio,
        isSuperfluidPool,
        myLiquidity: poolTVL.mul(actualShareRatio).toString(),
        myLiquidity1: poolTVL.mul(actualShareRatio),
        myAmounts,
        myLockedAmount: incentivizedPoolIds.includes(pool.id)
          ? poolTVL.mul(actualLockedShareRatio).toString()
          : undefined,
        apr,
      });
    } else {
      newPools.push({
        ...poolData,
        allGammShare: null,
        unlockingDatas: null,
        gammShare: null,
        poolCoinInfo,
        poolTVL: poolTVL,
        lockDurations,
        superFluidAPR,
        availableLP: "$0",
        myLiquidity: 0,
        isSuperfluidPool,
        myLockedAmount: 0,
        apr,
      });
    }
  });
  return newPools;
};


export const lockableDurations = async () => {
  const response = await axios.get(
    "https://lcd-osmosis.keplr.app/osmosis/pool-incentives/v1beta1/lockable_durations"
  );
  if (!response) {
    return [];
  }
  return response.data.lockable_durations
    .map((durationStr) => {
      return dayjs.duration(parseInt(durationStr.replace("s", "")) * 1000);
    })
    .slice()
    .sort((v1, v2) => {
      return v1.asMilliseconds() > v2.asMilliseconds() ? 1 : -1;
    });
};


export const computeAPY = (pool, duration = durations[0]) => {
  if (!incentivizedPoolIds.includes(pool.id)) {
    return new IntPretty(new Dec(0)).maxDecimals(2).trim(true);
  }
  const lockableDurations = durations.slice().sort((v1, v2) => {
    return v1.asMilliseconds() > v2.asMilliseconds() ? 1 : -1;
  });

  if (
    !lockableDurations.find(
      (lockableDuration) =>
        lockableDuration.asMilliseconds() === duration.asMilliseconds()
    )
  ) {
    return new IntPretty(new Dec(0)).maxDecimals(2).trim(true);
  }
  let apy = computeAPYForSpecificDuration(pool, duration);
  for (const lockableDuration of lockableDurations) {
    if (lockableDuration.asMilliseconds() >= duration.asMilliseconds()) {
      break;
    }
    apy = apy.add(computeAPYForSpecificDuration(pool, lockableDuration));
  }
  return apy;
};


const computeAPYForSpecificDuration = (pool, duration) => {
  const gaugeId = getIncentivizedGaugeId(pool.id, duration);
  if (gaugeId) {
    if (pool) {
      const mintDenom = "uosmo";
      const epochIdentifier = "day";
      if (mintDenom && epochIdentifier) {
        //получаем текущую эпоху
        const epoch = epochResponse?.data?.epochs.find(
          (elem) => elem.identifier === epochIdentifier
        );
        if (mintCurrency && mintCurrency.coinGeckoId && epoch.duration) {
          //(кажется) это общая стоимость всех инсентивированных пулов
          const totalWeight = new Int(
            distrResponse.data?.distr_info.total_weight
          );
          //стоимость инсентивированного пула
          const potWeight = getWeight(gaugeId);
          //цена осмосиса в пуле
          mintPrice = pool.id === "1" ? getPrice(pool) : mintPrice;

          //вычисление общей стоимости залоченных в инсентивайзд пуле денег
          const poolTVL = new PricePretty(
            fiatCurrency,
            new Dec(Math.round(pool.poolInfo[0]?.liquidity))
          );

          //не понимаю че такое GT. Сравнение с нулем?
          if (
            totalWeight.gt(new Int(0)) &&
            potWeight.gt(new Int(0)) &&
            mintPrice &&
            poolTVL.toDec().gt(new Dec(0))
          ) {
            // Количество монет, выпущенных за эпоху.

            const epochProvision = new CoinPretty(
              mintCurrency,
              new Dec(epochProvisions?.data.epoch_provisions)
            );
            if (epochProvision) {
              // считаем число эпох в году
              const numEpochPerYear =
                dayjs.duration({ years: 1 }).asMilliseconds() /
                dayjs
                  .duration(parseInt(epoch.duration.replace("s", "")) * 1000)
                  .asMilliseconds();
              // количество монет выпущенных за эпоху перемножаем на  число эпох в году. Чтобы что?
              const yearProvision = epochProvision.mul(
                new Dec(numEpochPerYear.toString())
              );
              // умножаем на пропорцию нового инсентивированного осмо, которая при дется на данный пул
              const yearProvisionToPots = yearProvision.mul(
                new Dec(
                  paramsResponse?.data?.params?.distribution_proportions.pool_incentives
                )
              );
              //умножаем на долю, которая приходится на стоимость текущего пула от всех-всех инсентивированных пулов
              const yearProvisionToPot = yearProvisionToPots.mul(
                new Dec(potWeight).quo(new Dec(totalWeight))
              );
              //"реальную" долларовую цену осмосиса делим на  годовой объем монет, которые предназначены пулу (yearProvisionToPot)
              const yearProvisionToPotPrice = new Dec(mintPrice.toString()).mul(
                yearProvisionToPot.toDec()
              );
              //полученное число делим на общую стоимость залоченных монет в текущем пуле
              return new IntPretty(yearProvisionToPotPrice.quo(poolTVL.toDec()))
                .decreasePrecision(2)
                .maxDecimals(2)
                .trim(true);
            }
          }
        }
      }
    }
    return new IntPretty(new Dec(0)).maxDecimals(2).trim(true);
  }
};


const getIncentivizedGaugeId = (poolId, duration) => {
  if (!incentivizedPoolsResponse) {
    return;
  }
  const incentivized = incentivizedPoolsResponse?.data?.incentivized_pools.find(
    (data) => {
      return (
        data.pool_id === poolId &&
        dayjs
          .duration(parseInt(data.lockable_duration.replace("s", "")) * 1000)
          .asMilliseconds() === duration.asMilliseconds()
      );
    }
  );

  if (incentivized) {
    return incentivized.gauge_id;
  }
};


const getWeight = (gaugeId) => {
  if (!distrResponse) {
    return new Int(0);
  }

  const record = distrResponse?.data?.distr_info.records.find(
    (record) => record.gauge_id === gaugeId
  );
  if (!record) {
    return new Int(0);
  }

  return new Int(record.weight);
};


const getPrice = (assets) => {
  let price = 0;
  let pool = assets?.poolInfo;
  if (pool) {
    price = (pool[0].price * pool[0]?.amount) / pool[1]?.amount;
  }
  return price;
};


export const getOwnPools = async (bech32Address) => {
  balancesResponse = await axios.get(
    "https://lcd-osmosis.keplr.app/bank/balances/" + bech32Address
  );
  lockedResponse = await axios.get(
    "https://lcd-osmosis.keplr.app/osmosis/lockup/v1beta1/account_locked_coins/" +
      bech32Address
  );
  let result = [];

  for (const bal of balancesResponse?.data?.result?.concat(
    lockedResponse.data?.coins
  )) {
    if (bal.denom.startsWith("gamm/pool/")) {
      result.push(bal.denom.replace("gamm/pool/", ""));
    }
  }
  result = [...new Set(result)];
  result.sort((e1, e2) => {
    return parseInt(e1) >= parseInt(e2) ? 1 : -1;
  });
  return result;
};


export const getAllGammShare = (poolId) => {
  let available = getAvailableGammShare(poolId);
  let locked = getLockedGammShare(poolId);
  return available.add(locked);
};


export const getAllGammShareRatio = (poolId) => {
  const pool = getPoolFromPagination(poolListWithPagination.data.pools, poolId);
  if (!pool) {
    return new IntPretty(new Int(0)).ready(false);
  }
  const share = getAllGammShare(poolId);
  const totalShare = new IntPretty(
    pool.total_shares.amount
  ).moveDecimalPointLeft(18);
  return new IntPretty(
    share.quo(totalShare).mul(DecUtils.getTenExponentNInPrecisionRange(2))
  )
    .maxDecimals(2)
    .trim(true);
};


export const getLockedGammShareRatio = (pool) => {
  if (!pool) {
    return new IntPretty(new Int(0)).ready(false);
  }
  const share = getLockedGammShare(pool.id);
  const totalShare = new IntPretty(
    pool.total_shares.amount
  ).moveDecimalPointLeft(18);
  return new IntPretty(
    share.quo(totalShare).mul(DecUtils.getTenExponentNInPrecisionRange(2))
  ).maxDecimals(2).trim(true);
};


const getLockedGammShareRatioByDuration = (share,pool) => {
  const totalShare = new IntPretty(
    pool.total_shares.amount
  ).moveDecimalPointLeft(18);
  return new IntPretty(
    share.quo(totalShare).mul(DecUtils.getTenExponentNInPrecisionRange(2))
  ).maxDecimals(2).trim(true);
};


export const getAvailableLPTokens = (pool) => {
  let poolTotalValueLocked = new PricePretty(fiatCurrency, new Dec(0));
  const share = getAvailableGammShare(pool.id);
  const totalShare = new IntPretty(
    pool.total_shares.amount
  ).moveDecimalPointLeft(18);
  poolTotalValueLocked = new PricePretty(
    fiatCurrency,
    new Dec(Math.round(pool.poolInfo[0]?.liquidity))
  );
  return !totalShare.toDec().equals(new Dec(0))
    ? poolTotalValueLocked.mul(share.quo(totalShare)).toString()
    : "$0";
};


export const getLockedGammShare = (poolId) => {
  let locked = null;
  lockedResponse.data?.coins?.forEach((pool) => {
    if (pool.denom.startsWith("gamm/pool/")) {
      let id = pool.denom.replace("gamm/pool/", "");
      if (id === poolId) {
        locked = new CoinPretty(getGammInfo(poolId), new Dec(pool.amount));
      }
    }
  });
  if (locked) {
    return locked;
  }
  return new CoinPretty(getGammInfo(poolId), new Dec(0));
};


export const getAvailableGammShare = (poolId) => {
  let available = null;
  balancesResponse.data?.result?.forEach((pool) => {
    if (pool.denom.startsWith("gamm/pool/")) {
      let id = pool.denom.replace("gamm/pool/", "");
      if (id === poolId) {
        available = new CoinPretty(getGammInfo(poolId), new Dec(pool.amount));
      }
    }
  });
  if (available) {
    return available;
  }
  return new CoinPretty(getGammInfo(poolId), new Dec(0));
};


const getLockedCoinWithDuration = (pool, duration) => {
  const currency = getGammInfo(pool.id);
  if (!locksResponse.data) {
    return {
      amount: new CoinPretty(currency, new Dec(0)),
      lockIds: [],
    };
  }

  const matchedLocks = locksResponse.data.locks
    .filter((lock) => {
      return (
        Math.abs(
          Number.parseInt(lock.duration.replace("s", "")) - duration.asSeconds()
        ) <= 60
      );
    })
    .filter((lock) => {
      return new Date(lock.end_time).getTime() <= 0;
    })
    .filter((lock) => {
      return (
        lock.coins.find((coin) => coin.denom === currency.coinMinimalDenom) !=
        null
      );
    });

  let coin = new CoinPretty(currency, new Dec(0));
  for (const lock of matchedLocks) {
    const matchedCoin = lock.coins.find(
      (coin) => coin.denom === currency.coinMinimalDenom
    );
    if (matchedCoin) {
      coin = coin.add(new CoinPretty(currency, new Dec(matchedCoin.amount)));
    }
  }

  return {
    amount: coin,
    lockIds: matchedLocks.map((lock) => lock.ID),
  };
};


export function estimateJoinSwapExternAmountIn(tokenIn) {
  const { pool } = store.getState().pool;
  const poolAsset = pool.pool_assets.find(
    (item) => item.token.denom === tokenIn.denom
  );
  const shareOutAmount = calcPoolOutGivenSingleIn(
    new Dec(poolAsset.token.amount),
    new Dec(poolAsset.weight),
    new Dec(pool.total_shares.amount),
    new Dec(pool.total_weight),
    new Dec(tokenIn.amount),
    new Dec(pool.pool_params.swap_fee)
  ).truncate();
  return shareOutAmount;
}


export function estimateExitPool(shareInAmount, pool) {
  try {
    const tokenOuts = [];

    const totalShare = pool.total_shares.amount;
    shareInAmount = new Dec(shareInAmount)
      .mul(DecUtils.getTenExponentNInPrecisionRange(18))
      .truncate();
    const shareRatio = new Dec(shareInAmount).quo(new Dec(totalShare));
    if (shareRatio.lte(new Dec(0))) {
      throw new Error("share ratio is zero or negative");
    }

    for (const poolAsset of pool.pool_assets) {
      const tokenOutAmount = shareRatio
        .mul(new Dec(poolAsset.token.amount))
        .truncate();
      tokenOuts.push(new Coin(poolAsset.token.denom, tokenOutAmount));
    }

    const result = tokenOuts.map((primitive, i) => {
      const currency = getPoolTokenInfo(
        pool.poolInfo[i].coingecko_id,
        pool.poolInfo[i].symbol
      );
      if (!currency) {
        throw new Error("Unknown currency");
      }
      const amount = new CoinPretty(currency, primitive.amount);
      amount._options.hideDenom = true;
      return amount;
    });
    return result;
  } catch {}
}


export const getMaxBalance = (index, pool, prettyBalanceList, amounts) => {
  let currentBalance = 0;
  prettyBalanceList.forEach((item) => {
    if (item.denom === amounts[index].denom) {
      currentBalance = item.amount;
    }
  });
  let balanceInfo = new CoinPretty(
    pool.poolCoinInfo[index],
    new Dec(currentBalance)
  );
  if (amounts[index].denom === "uosmo") {
    balanceInfo = new Dec(currentBalance).sub(new Dec('12500'));
    balanceInfo = new CoinPretty(pool.poolCoinInfo[index], balanceInfo);
  }
  balanceInfo._options.hideDenom = true;
  return balanceInfo.trim(true).shrink(true).maxDecimals(6).toString();
};


const getUnlockingCoinWithDuration = (currency, duration) => {
  const matchedLocks = locksResponse.data.locks
    .filter((lock) => {
      return (
        Math.abs(
          Number.parseInt(lock.duration.replace("s", "")) - duration.asSeconds()
        ) <= 60
      );
    })
    .filter((lock) => {
      return new Date(lock.end_time).getTime() > 0;
    })
    .filter((lock) => {
      return (
        lock.coins.find((coin) => coin.denom === currency.coinMinimalDenom) !=
        null
      );
    });

  const map = new Map();

  for (const lock of matchedLocks) {
    const matchedCoin = lock.coins.find(
      (coin) => coin.denom === currency.coinMinimalDenom
    );
    if (matchedCoin) {
      const time = new Date(lock.end_time).getTime();
      if (!map.has(time)) {
        map.set(time, {
          amount: new CoinPretty(currency, new Dec(0)),
          lockIds: [],
          endTime: new Date(lock.end_time),
        });
      }

      const value = map.get(time);
      value.amount = value.amount.add(
        new CoinPretty(currency, new Dec(matchedCoin.amount))
      );
      value.amount._options.hideDenom = true;
      value.lockIds.push(lock.ID);

      map.set(time, value);
    }
  }

  return [...map.values()].sort((v1, v2) => {
    return v1.endTime > v2.endTime ? 1 : -1;
  });
};
