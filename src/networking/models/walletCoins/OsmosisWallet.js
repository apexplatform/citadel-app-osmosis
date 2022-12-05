import Wallet from '../Wallet';
import { getRequest } from '../../requests/getRequest';
import { store } from "../../../store/store";
import * as Sentry from "@sentry/react";
import { utils } from '@citadeldao/apps-sdk';
import { DecUtils, Dec, IntPretty } from "@keplr-wallet/unit";
import BigNumber from "bignumber.js";
import { getPools, getPoolUpdate, getDenomByCode, estimateJoinSwapExternAmountIn } from "../../osmosisMethods/poolMethods";
const requestManager = new utils.RequestManager()
const walletRequest = getRequest("wallet");
export default class OsmosisWallet extends Wallet {
    async getTokenBalance() {
      const { auth_token } = store.getState().user;
      const data = await requestManager.send(walletRequest.getTokenBalance({
        network: this.net,
        address: this.address,
        token: auth_token,
      }));
      if (data.ok) {
        return data;
      } else {
        Sentry.captureException(
          data.error?.message || data.error?.message?.stack
        );
        return new Error(data.error?.message);
      }
    }

    getMinOutAmount(spotPriceBefore, tokenIn, priceImpact) {
      const effectivePrice = spotPriceBefore.mul(priceImpact.add(new Dec(1)));
      return new Dec(tokenIn).quo(effectivePrice).truncate();
    }

    getMaxInAmount(spotPriceBefore, tokenOut, priceImpact) {
      const effectivePrice = spotPriceBefore.mul(priceImpact.add(new Dec(1)));
      return new Dec(tokenOut).mul(effectivePrice).truncate();
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
      trade
    ) {
      const { auth_token } = store.getState().user;
      const maxSlippageDec = new Dec(slippageTolerance.toString()).quo(
        DecUtils.getTenExponentNInPrecisionRange(2)
      );

      const dec_amount = new Dec(fromTokenAmount.toString())
        .mul(DecUtils.getTenExponentNInPrecisionRange(+fromToken.decimals))
        .truncate();
      const dec_to_amount = new Dec(toTokenAmount.toString())
        .mul(DecUtils.getTenExponentNInPrecisionRange(+toToken.decimals))
        .truncate();

      const tokenOutMinAmount = this.getMinOutAmount(trade.spotPriceBefore, dec_amount, maxSlippageDec)
      const tokenInMaxAmount = this.getMaxInAmount(trade.spotPriceBefore, dec_to_amount, maxSlippageDec)

      const routes = poolInfo.map((item) => {
        return {
          pool_id: item.id.toString(),
          token_out_denom: item.to.denom,
        };
      });
      const routesOut = poolInfo.map((item) => {
        return {
          pool_id: item.id.toString(),
          token_in_denom: item.from.denom,
        };
      });
      let route = "";
      for(let i = 0; i < poolInfo?.length; i++){
        if(i===0){
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
        token_in: {
          denom: poolInfo[0]?.from.denom,
          amount: dec_amount.toString(),
        },
        token_out_min_amount: tokenOutMinAmount.toString(),
      };
      const valueOut = {
        sender: this.address,
        routes: routesOut,
        token_out: {
          denom: poolInfo[poolInfo.length-1]?.to.denom,
          amount: dec_to_amount.toString(),
        },
        token_in_max_amount: tokenInMaxAmount.toString(),
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
        token: auth_token
      };
      return body;
  }
  generateCreatePoolTransaction(selectedTokens, swapFee) {
    const { auth_token } = store.getState().user;
    const poolParams = {
      swap_fee: new Dec(swapFee).quo(DecUtils.getPrecisionDec(2)).toString(),
      exit_fee: new Dec(0).toString(),
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
    selectedTokens.forEach((elem) => {
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
            pool_params: poolParams,
            pool_assets: poolAssets,
            future_pool_governor: "24h",
          },
        },
      ],
      memo: "Create pool via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      meta_info,
    };
    return body;
  }
  generateLockTokensTransaction(pool, shareAmount, selectedDuration) {
    const { auth_token } = store.getState().user;
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
      meta_info,
    };
    return body;
  }
  generateSuperfluidDelegateTransaction(validator,lockData) {
    const { auth_token } = store.getState().user;
    const messages = lockData.lockup?.lockIds?.map((id) => {
      return {
        type: "osmosis/superfluid-delegate",
        value: {
          sender: this.address,
          lock_id: id,
          val_addr: validator.address
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
      meta_info,
    };
    return body;
  }
  generateExitPoolTransaction(pool, amounts, shareAmount, slippageTolerance) {
    const { auth_token } = store.getState().user;
    const shareInAmount = new Dec(shareAmount)
      .mul(DecUtils.getPrecisionDec(18))
      .truncate();
    const maxSlippageDec = new Dec(Math.floor(slippageTolerance)).quo(
      DecUtils.getPrecisionDec(2)
    );
    const tokenOutMins = pool.pool_assets.map((item, i) => {
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
            pool_id: pool.id,
            token_out_mins: tokenOutMins,
            share_in_amount: shareInAmount.toString(),
          },
        },
      ],
      memo: "Exit-pool via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      meta_info,
    };
    return body;
  }
  generateLockAndDelegateTransaction(pool, shareAmount, validator) {
    const { auth_token } = store.getState().user;
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
      meta_info,
    };
    return body;
  }
  generateBeginUnlockTokensTransaction(selectedDuration,isSyntheticLock) {
    const { auth_token } = store.getState().user;
    let messages = []
    selectedDuration.lockup.lockIds?.forEach((id) => {
      if(!isSyntheticLock){
        messages.push({
          type: "osmosis/lockup/begin-unlocking",
          value: {
            owner: this.address,
            ID: id,
            coins: []
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
      meta_info,
    };
    return body;
  }
  generateUnlockTokensTransaction(lockIds) {
    const { auth_token } = store.getState().user;
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
      meta_info,
    };
    return body;
  }
  generateJoinPoolTransaction(
    pool,
    amounts,
    shareOutAmount,
    slippageTolerance
  ) {
    const { auth_token } = store.getState().user;
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
            pool_id: pool.id,
            share_out_amount: new Dec(shareOutAmount.toDec().toString())
              .mul(DecUtils.getPrecisionDec(18))
              .truncate()
              .toString(),
            token_in_maxs: tokenInMaxs,
          },
        },
      ],
      memo: "Join pool via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      meta_info,
    };
    return body;
  }
  generateSingleLPJoinPoolTransaction(pool, amounts, slippageTolerance) {
    const { auth_token } = store.getState().user;
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
    pool.poolInfo.forEach((elem) => {
      if (elem.denom === tokenIn.denom) {
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
            pool_id: pool.id,
            token_in: tokenIn,
            share_out_min_amount: shareOutMinAmount.toString(),
          },
        },
      ],
      memo: "Join pool via Citadel.one app",
      publicKey: this.publicKey,
      token: auth_token,
      meta_info,
    };
    return body;
  }
}