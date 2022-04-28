import Wallet from "../Wallet";
import useApi from "../../api/useApi";
import { DecUtils, Dec, IntPretty } from "@keplr-wallet/unit";
import store from "../../../store/store";
import BigNumber from "bignumber.js";
import * as Sentry from "@sentry/react";
import {
  getPools,
  estimateJoinSwapExternAmountIn,
  getPoolUpdate,
  getDenomByCode
} from "../../osmosisMethods/poolMethods";

const api = useApi("wallet");
export default class OsmosisWallet extends Wallet {
  constructor(opts) {
    super(opts);
  }
  getMinOutAmount(estimateOutAmount, slippage) {
    return new Dec(estimateOutAmount).mul(new Dec(1).sub(slippage)).truncate();
  }
  getMaxInAmount(estimateInAmount, slippage) {
    return new Dec(estimateInAmount).mul(new Dec(1).add(slippage)).truncate();
  }
  async getTokenBalance() {
    const { auth_token } = store.getState().userReducer;
    const data = await api.getTokenBalance({
      network: this.net,
      address: this.address,
      token: auth_token,
    });
    if (data.ok) {
      return data;
    } else {
      Sentry.captureException(
        data.error?.message || data.error?.message?.stack
      );
      return new Error(data.error?.message);
    }
  }
  getPools() {
    return getPools(this.address);
  }
  getPoolUpdate(pool) {
    return getPoolUpdate(this.address, pool);
  }
  generateSwapTransaction(
    isExact,
    fromToken,
    fromTokenAmount,
    toToken,
    toTokenAmount,
    slippageTolerance,
    poolInfo,
  ) {
    const { auth_token } = store.getState().userReducer;
    const maxSlippageDec = new Dec(Math.floor(slippageTolerance)).quo(
      DecUtils.getPrecisionDec(2)
    );
    const dec_amount = new Dec(fromTokenAmount.toString())
      .mul(DecUtils.getPrecisionDec(+fromToken.decimals))
      .truncate();
    const dec_to_amount = new Dec(toTokenAmount.toString())
      .mul(DecUtils.getPrecisionDec(+toToken.decimals))
      .truncate();
    const tokenOutMinAmount = this.getMinOutAmount(dec_to_amount,maxSlippageDec);
    const tokenInMaxAmount = this.getMaxInAmount(dec_amount,maxSlippageDec);

    const routes = poolInfo.map((item) => {
      return {
        poolId: item.id.toString(),
        tokenOutDenom: item.to.denom,
      };
    });
    const routesOut = poolInfo.map((item) => {
      return {
        poolId: item.id.toString(),
        tokenInDenom: item.from.denom,
      };
    });
    let route = "";
    for(let i = 0; i < poolInfo?.length; i++){
      if(i==0){
        route += poolInfo[i]?.from?.symbol + "->" + poolInfo[i]?.to?.symbol;
      }else{
        route += "->" + poolInfo[i]?.to?.symbol;
      }  
    }
    let meta_info = [
      {
        title: `Swap from ${!isExact ? "(estimated)" : ""}`,
        value: `${BigNumber(fromTokenAmount).toFixed()} ${fromToken.code}`,
        type: "text",
      },
      {
        title: `Swap to ${isExact ? "(estimated)" : ""}`,
        value: `${BigNumber(toTokenAmount).toFixed()} ${toToken.code}`,
        type: "text",
      },
      {
        title: `Route`,
        value: `${route}`,
        type: "text",
      },
      {
        title: "Slippage tolerance",
        value: `${slippageTolerance}%`,
        type: "text",
      },
    ];
    const valueIn = {
      sender: this.address,
      routes: routes,
      tokenIn: {
        denom: poolInfo[0]?.from.denom,
        amount: dec_amount.toString(),
      },
      tokenOutMinAmount: tokenOutMinAmount.toString(),
    };
    const valueOut = {
      sender: this.address,
      routes: routesOut,
      tokenOut: {
        denom: poolInfo[poolInfo.length-1]?.to.denom,
        amount: dec_to_amount.toString(),
      },
      tokenInMaxAmount: tokenInMaxAmount.toString(),
    };
    const body = {
      gas: "750000",
      meta_info,
      msgs: [
        {
          type: isExact
            ? "osmosis/gamm/swap-exact-amount-in"
            : "osmosis/gamm/swap-exact-amount-out",
          value: isExact ? valueIn : valueOut,
        },
      ],
      memo: "Swap via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      fee: {
        denom: "uosmo",
        amount: "0",
      },
    };
    return body;
  }
  generateJoinPoolTransaction(
    pool,
    amounts,
    shareOutAmount,
    slippageTolerance
  ) {
    const { auth_token } = store.getState().userReducer;
    const maxSlippageDec = new Dec(Math.floor(slippageTolerance)).quo(
      DecUtils.getPrecisionDec(2)
    );
    const tokenInMaxs = maxSlippageDec.equals(new Dec(0))
      ? null
      : amounts.map((tokenIn) => {
          const dec = new Dec(tokenIn.amount);
          const amount = dec
            .mul(DecUtils.getPrecisionDec(6))
            .mul(new Dec(1).add(maxSlippageDec))
            .truncate();

          return {
            denom: tokenIn.denom,
            amount: amount.toString(),
          };
        });
    let meta_info = [
      {
        title: `Pool Id`,
        value: `${pool.id}`,
        type: "text",
      },
      {
        title: `Token In`,
        value: `${amounts[0].amount + " " + pool.poolInfo[0].symbol}, ${
          amounts[1].amount + " " + pool.poolInfo[1].symbol
        }`,
        type: "text",
      },
      {
        title: "Token Out",
        value: `${shareOutAmount.toDec().toString()} GAMM-${pool.id}`,
        type: "text",
      },
    ];
    const body = {
      gas: "1500000",
      msgs: [
        {
          type: "osmosis/gamm/join-pool",
          value: {
            sender: this.address,
            poolId: pool.id,
            shareOutAmount: new Dec(shareOutAmount.toDec().toString())
              .mul(DecUtils.getPrecisionDec(18))
              .truncate()
              .toString(),
            tokenInMaxs,
          },
        },
      ],
      memo: "Join pool via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      fee: {
        denom: "uosmo",
        amount: "0",
      },
      meta_info,
    };
    return body;
  }
  generateSingleLPJoinPoolTransaction(pool, amounts, slippageTolerance) {
    const { auth_token } = store.getState().userReducer;
    const amount = new Dec(amounts.amount)
      .mul(DecUtils.getPrecisionDec(amounts.decimals))
      .truncate();
    const tokenIn = {
      denom: amounts.denom,
      amount: amount.toString(),
    };
    const maxSlippageDec = new Dec(Math.floor(slippageTolerance)).quo(
      DecUtils.getPrecisionDec(2)
    );
    const outRatio = new Dec(1).sub(maxSlippageDec);
    const shareOutAmount = estimateJoinSwapExternAmountIn(tokenIn);
    let symbol = "";
    pool.poolInfo.map((elem) => {
      if (elem.denom == tokenIn.denom) {
        symbol = elem.symbol;
      }
    });
    const shareOutMinAmount = new Dec(shareOutAmount.toDec().toString())
      .mul(outRatio)
      .truncate();
    const outAmount = new IntPretty(
      shareOutMinAmount.toString()
    ).moveDecimalPointLeft(18);
    let meta_info = [
      {
        title: `Pool Id`,
        value: `${pool.id}`,
        type: "text",
      },
      {
        title: `Token In`,
        value: `${amounts.amount + " " + symbol}`,
        type: "text",
      },
      {
        title: "Token Out",
        value: `${outAmount.toDec().toString()} GAMM-${pool.id}`,
        type: "text",
      },
    ];
    const body = {
      gas: "1500000",
      msgs: [
        {
          type: "osmosis/gamm/join-swap-extern-amount-in",
          value: {
            sender: this.address,
            poolId: pool.id,
            tokenIn,
            shareOutMinAmount: shareOutMinAmount.toString(),
          },
        },
      ],
      memo: "Join pool via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      fee: {
        denom: "uosmo",
        amount: "0",
      },
      meta_info,
    };
    return body;
  }
  generateExitPoolTransaction(pool, amounts, shareAmount, slippageTolerance) {
    const { auth_token } = store.getState().userReducer;
    const shareInAmount = new Dec(shareAmount)
      .mul(DecUtils.getPrecisionDec(18))
      .truncate();
    const maxSlippageDec = new Dec(Math.floor(slippageTolerance)).quo(
      DecUtils.getPrecisionDec(2)
    );
    const tokenOutMins = pool.poolAssets.map((item, i) => {
      let amount = amounts[i]
        .toDec()
        .mul(new Dec(1).sub(maxSlippageDec))
        .mul(DecUtils.getPrecisionDec(pool.poolCoinInfo[i].coinDecimals))
        .truncate();
      return {
        denom: item.token.denom,
        amount: amount.toString(),
      };
    });
    let meta_info = [
      {
        title: `Pool Id`,
        value: `${pool.id}`,
        type: "text",
      },
      {
        title: `Token In`,
        value: `${shareAmount} GAMM-${pool.id}`,
        type: "text",
      },
      {
        title: "Token Out",
        value: `${
          amounts[0].maxDecimals(4).toString() + " " + pool.poolInfo[0].symbol
        }, ${
          amounts[1].maxDecimals(4).toString() + " " + pool.poolInfo[1].symbol
        }`,
        type: "text",
      },
    ];
    const body = {
      gas: "1500000",
      msgs: [
        {
          type: "osmosis/gamm/exit-pool",
          value: {
            sender: this.address,
            poolId: pool.id,
            tokenOutMins,
            shareInAmount: shareInAmount.toString(),
          },
        },
      ],
      memo: "Exit-pool via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      fee: {
        denom: "uosmo",
        amount: "0",
      },
      meta_info,
    };
    return body;
  }
  generateLockTokensTransaction(pool, shareAmount, selectedDuration) {
    const { auth_token } = store.getState().userReducer;
    const shareInAmount = new Dec(shareAmount)
      .mul(DecUtils.getPrecisionDec(18))
      .truncate();
    const duration =
      selectedDuration.lockableDuration.asSeconds() * 1_000_000_000;
    let meta_info = [
      {
        title: `Duration`,
        value: `${selectedDuration.lockableDuration.asDays()}`,
        type: "text",
      },
      {
        title: `Token In`,
        value: `${shareAmount} GAMM-${pool.id}`,
        type: "text",
      },
    ];
    const body = {
      gas: "450000",
      msgs: [
        {
          type: "osmosis/lockup/lock-tokens",
          value: {
            owner: this.address,
            duration: duration.toString(),
            coins: [
              {
                amount: shareInAmount.toString(),
                denom: `gamm/pool/${pool.id}`,
              },
            ],
          },
        },
      ],
      memo: "Lock tokens via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      fee: {
        denom: "uosmo",
        amount: "0",
      },
      meta_info,
    };
    return body;
  }
  generateLockAndDelegateTransaction(pool, shareAmount, validator) {
    const { auth_token } = store.getState().userReducer;
    const shareInAmount = new Dec(shareAmount)
      .mul(DecUtils.getPrecisionDec(18))
      .truncate();
    let meta_info = [
      {
        title: `Validator`,
        value: `${validator.name}`,
        type: "text",
      },
      {
        title: `Token In`,
        value: `${shareAmount} GAMM-${pool.id}`,
        type: "text",
      },
    ];
    const body = {
      gas: "500000",
      msgs: [
        {
          type: "osmosis/lock-and-superfluid-delegate",
          value: {
            sender: this.address,
            val_addr: validator.address,
            coins: [
              {
                amount: shareInAmount.toString(),
                denom: `gamm/pool/${pool.id}`,
              },
            ],
          },
        },
      ],
      memo: "Lock and delegate via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      fee: {
        denom: "uosmo",
        amount: "0",
      },
      meta_info,
    };
    return body;
  }
  generateBeginUnlockTokensTransaction(selectedDuration,isSyntheticLock) {
    const { auth_token } = store.getState().userReducer;
    let messages = []
    selectedDuration.lockup.lockIds.map((id) => {
      if(!isSyntheticLock){
        messages.push({
          type: "osmosis/lockup/begin-unlock-period-lock",
          value: {
            owner: this.address,
            ID: id,
          },
        });
      }else{
        messages.push({
          type: "osmosis/superfluid-undelegate",
          value: {
            sender: this.address,
            lock_id: id,
          },
        });
        messages.push({
          type: "osmosis/superfluid-unbond-lock",
          value: {
            sender: this.address,
            lock_id: id,
          },
        });
      }
     
    });
    let meta_info = [
      {
        title: `Lock Ids`,
        value: `${selectedDuration.lockup.lockIds.toString()}`,
        type: "text",
      },
    ];
    const body = {
      gas: "600000",
      msgs: messages,
      memo: "Unlock tokens via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      fee: {
        denom: "uosmo",
        amount: "0",
      },
      meta_info,
    };
    return body;
  }
  generateUnlockTokensTransaction(lockIds) {
    const { auth_token } = store.getState().userReducer;
    const messages = lockIds.map((id) => {
      return {
        type: "osmosis/lockup/unlock-period-lock",
        value: {
          owner: this.address,
          ID: id,
        },
      };
    });
    let meta_info = [
      {
        title: `Lock Ids`,
        value: `${lockIds.toString()}`,
        type: "text",
      },
    ];
    const body = {
      gas: "400000",
      msgs: messages,
      memo: "Unlock tokens via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      fee: {
        denom: "uosmo",
        amount: "0",
      },
      meta_info,
    };
    return body;
  }
  generateCreatePoolTransaction(selectedTokens, swapFee) {
    const { auth_token } = store.getState().userReducer;
    const poolParams = {
      swapFee: new Dec(swapFee).quo(DecUtils.getPrecisionDec(2)).toString(),
      exitFee: new Dec(0).toString(),
    };
    const poolAssets = [];
    for (const asset of selectedTokens) {
      poolAssets.push({
        weight: new Dec(asset.percent)
          .mul(DecUtils.getPrecisionDec(4))
          .truncate()
          .toString(),
        token: {
          denom: getDenomByCode(asset.token.code),
          amount: new Dec(asset.amount.toString())
            .mul(DecUtils.getPrecisionDec(6))
            .truncate()
            .toString(),
        },
      });
    }
    let poolAssetsText = "";
    selectedTokens.map((elem) => {
      poolAssetsText += elem.token.code + ` (${elem.percent}%),`;
    });
    let meta_info = [
      {
        title: `Exit Fee`,
        value: `0%`,
        type: "text",
      },
      {
        title: `Swap Fee`,
        value: `${swapFee}%`,
        type: "text",
      },
      {
        title: `Pool Assets`,
        value: poolAssetsText,
        type: "text",
      },
    ];
    const body = {
      gas: "250000",
      msgs: [
        {
          type: "osmosis/gamm/create-balancer-pool",
          value: {
            sender: this.address,
            poolParams: poolParams,
            poolAssets: poolAssets,
            future_pool_governor: "24h",
          },
        },
      ],
      memo: "Create pool via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      fee: {
        denom: "uosmo",
        amount: "0",
      },
      meta_info,
    };
    return body;
  }

  generateSuperfluidDelegateTransaction(validator,lockData) {
    const { auth_token } = store.getState().userReducer;
    const messages = lockData.lockup?.lockIds?.map((id) => {
      return {
        type: "osmosis/superfluid-delegate",
        value: {
          sender: this.address,
          lockId: id,
          valAddr: validator.address
        }
      };
    });
    let meta_info = [
      {
        title: `Validator`,
        value: `${validator.name}`,
        type: "text",
      },
    ];
    const body = {
      gas: "400000",
      msgs: messages,
      memo: "Superfluid Delegate via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      fee: {
        denom: "uosmo",
        amount: "0",
      },
      meta_info,
    };
    return body;
  }
}
