import { useEffect, useState } from "react";
import "../styles/components/poolAmountInput.css";
import text from "../../text.json";
import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { connect } from "react-redux";
import { findIndex } from "lodash-es";
import { numberWithCommas } from "../helpers/numberFormatter";
import BigNumber from "bignumber.js";
import { OSMO_MEDIUM_TX_FEE } from "../../networking/osmosisMethods/constans";
const PoolAmountInput = (props) => {
  const { amount } = props.walletReducer;
  const { tokenList, currentWallet } = props.walletReducer;
  const [amounts, update] = useState(props.amount[props.index]?.amount);
  const [currencyOffset, setCurrencyOffset] = useState(
    (amounts?.toString().length + 1) * 8 || 30
  );
  const { pool, tokenBalances } = props.poolReducer;
  const showMax = props.hideMax || false;
  const showFee = props.hideFee || false;
  const fee = OSMO_MEDIUM_TX_FEE;
  const checkAmount = (val) => {
    val = val.replace(/[^0-9\.]/g, "");
    if (+amounts == 0 && val.length == 2 && val[1] != "." && val[1] == "0") {
      props.setAmount(props.index, val[0], props.isSingle);
    } else if (val[0] == "0" && val[1] != ".") {
      props.setAmount(props.index, BigNumber(val).toFixed(), props.isSingle);
    } else {
      props.setAmount(props.index, val, props.isSingle);
    }
    update(val);
    setCurrencyOffset((val.toString().length + 1) * 8);
  };
  const setMaxAmount = () => {
    let feasibleMaxFound = false;
    if (!props.isSingle) {
      if (props.prettyBalanceList.length < pool.poolAssets.length) {
        props.setAmount(props.index, "0", props.isSingle, true);
        return;
      }
      props.prettyBalanceList?.forEach((item) => {
        if (feasibleMaxFound) {
          return;
        }
        let balance = new CoinPretty({ coinDecimals: 6 }, new Dec(item.amount));
        balance._options.hideDenom = true;
        const baseBalanceInt = new IntPretty(balance);
        const totalShare = new IntPretty(new Dec(pool.totalShares.amount));
        const basePoolAsset = pool.poolAssets.find(
          (asset) => asset.token.denom === item.denom
        );
        const currentAssetAmount = new IntPretty(
          new Dec(basePoolAsset.token.amount)
        );
        const baseShareOutAmount = baseBalanceInt
          .mul(totalShare)
          .quo(currentAssetAmount);
        const outAmountInfoList = pool.poolAssets.map((poolAsset) => {
          const coinMinimalDenom = poolAsset.token.denom;
          if (basePoolAsset.token.denom === coinMinimalDenom) {
            return {
              coinMinimalDenom,
              outAmount: baseBalanceInt,
            };
          }
          const assetAmount = new IntPretty(new Dec(poolAsset.token.amount));
          return {
            coinMinimalDenom,
            outAmount: baseShareOutAmount.mul(assetAmount).quo(totalShare),
          };
        });
        const hasInsufficientBalance = outAmountInfoList.some(
          (outAmountInfo) => {
            const balanceInfo = props.prettyBalanceList.find(
              (balance) => balance.denom === outAmountInfo.coinMinimalDenom
            );
            let balance = new CoinPretty(
              { coinDecimals: 6 },
              new Dec(balanceInfo?.amount || "0")
            );
            balance._options.hideDenom = true;
            const balanceInt = new IntPretty(balance);
            return balanceInt.toDec().lt(outAmountInfo.outAmount.toDec());
          }
        );
        if (hasInsufficientBalance) {
          return;
        }
        feasibleMaxFound = true;
        const osmoIndex = findIndex(pool.poolAssets, (poolAsset) => {
          return poolAsset.token.denom === "uosmo";
        });
        if (osmoIndex !== -1) {
          const osmoOutAmountInfo = outAmountInfoList.find(
            (outAmountInfo) => outAmountInfo.coinMinimalDenom === "uosmo"
          );
          let osmoBalanceInfo = tokenBalances.find(
            (balance) => balance.denom === "uosmo"
          );
          osmoBalanceInfo = new CoinPretty(
            { coinDecimals: 6 },
            new Dec(osmoBalanceInfo?.amount || 0)
          );
          const osmoOutAmount = osmoBalanceInfo
            .toDec()
            .sub(new Dec(OSMO_MEDIUM_TX_FEE))
            .lt(osmoOutAmountInfo.outAmount.toDec())
            ? osmoOutAmountInfo.outAmount.sub(new Dec(OSMO_MEDIUM_TX_FEE))
            : osmoOutAmountInfo.outAmount;
          props.setAmount(
            osmoIndex,
            osmoOutAmount
              .trim(true)
              .shrink(true)
              .maxDecimals(6)
              .locale(false)
              .toString(),
            props.isSingle,
            true
          );
          return;
        }
        const baseOutAmountInfo = outAmountInfoList.find((outAmountInfo) => {
          return (
            outAmountInfo.coinMinimalDenom === pool.poolAssets[0].token.denom
          );
        });
        props.setAmount(
          0,
          baseOutAmountInfo.outAmount
            .trim(true)
            .shrink(true)
            .maxDecimals(6)
            .locale(false)
            .toString(),
          props.isSingle,
          true
        );
      });
    } else {
      props.setAmount(props.index, "max", props.isSingle);
    }
    update(props.amount[props.index].amount);
    setCurrencyOffset(
      (props.amount[props.index]?.amount.toString().length + 1) * 8 || 30
    );
  };
  const getBalance = () => {
    let token = tokenList.find((elem) => elem.code == props.symbol);
    if (token && token.balance) {
      return token.balance;
    }
    if (props.symbol == "OSMO") {
      return currentWallet?.balance?.mainBalance;
    }
    return 0;
  };
  useEffect(() => {
    update(props.amount[props.index].amount);
    setCurrencyOffset(
      (props.amount[props.index]?.amount.toString().length + 1) * 8 || 30
    );
  }, [props.amount, amount]);
  return (
    <div className="pool-amount-container">
      <div className="balance-container">
        <h5>{text.BALANCE}: </h5>
        <span className="balance-amount">{numberWithCommas(getBalance())}</span>
        <h5>{props.symbol}</h5>
      </div>
      <div className="pool-input-container">
        <input value={amounts} onChange={(e) => checkAmount(e.target.value)} />
        <span
          className="input-currency"
          style={{ left: `${currencyOffset}px` }}
        >
          {props.symbol}
        </span>
        {!showMax && (
          <button className="max-btn" onClick={() => setMaxAmount()}>
            Max
          </button>
        )}
      </div>
      {!showFee && (
        <div className="fee-container">
          <h5>{text.FEE_TEXT}</h5>
          <span className="fee-amount">{fee} </span>
          <h5>{props.symbol}</h5>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, {})(PoolAmountInput);
