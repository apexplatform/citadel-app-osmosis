import React, { useEffect, useState } from "react";
import { FormItem, Div, Group } from "@vkontakte/vkui";
import "../styles/panels/swap.css";
import AmountInput from "../uikit/AmountInput";
import TokenSelect from "../uikit/TokenSelect";
import {
  updateSwapInfo,
  setIndependentField,
} from "../../store/actions/swapActions";
import Header from "../uikit/Header";
import { connect } from "react-redux";
import { numberWithCommas, formatByDecimals } from "../helpers/numberFormatter";
import SwapButton from "../uikit/SwapButton";
import Icon from "../uikit/Icon";
import {
  setFromToken,
  setToToken,
  setAmount,
} from "../../store/actions/walletActions";
import FeeInfoBlock from "../uikit/FeeInfoBlock";
const Swap = (props) => {
  const [isExactIn, setExactIn] = useState(true);
  const { rate, independentField, outAmout, fromUSD, toUSD, swapPools } =
    props.swapReducer;
  const { fromToken, toToken, currentWallet, amount } = props.walletReducer;
  const showFee = fromToken?.code === currentWallet?.code;
  const dependentField = independentField === "INPUT" ? "OUTPUT" : "INPUT";
  const parsedAmounts = {
    INPUT: independentField === "INPUT" ? amount : outAmout,
    OUTPUT: independentField === "OUTPUT" ? amount : outAmout,
  };
  const formattedAmounts = {
    [independentField]: formatByDecimals(amount,+fromToken?.decimals),
    [dependentField]: formatByDecimals(parsedAmounts[dependentField],+toToken?.decimals),
  };
  const fromUSDBalance =
    +formattedAmounts["INPUT"] != 0 ? fromUSD * formattedAmounts["INPUT"] : 0;
  const toUSDBalance =
    +formattedAmounts["OUTPUT"] != 0 ? toUSD * formattedAmounts["OUTPUT"] : 0;
  const reverseTokens = () => {
    props.setFromToken(toToken);
    props.setAmount(formattedAmounts[dependentField]);
    props.setToToken(fromToken);
    props.updateSwapInfo(formattedAmounts[dependentField], isExactIn);
  };
  useEffect(() => {
    if(swapPools){
      props.updateSwapInfo(formattedAmounts[independentField], isExactIn);
    } 
  }, [fromToken, toToken,swapPools, currentWallet, amount]);
  return (
    <Group className="swap-container">
      <Header title="Osmosis swap" />
      <div className="swap-column">
        <FormItem
          top={"From" + (independentField === "OUTPUT" ? " (estimated)" : "")}
          className="formTokenItem"
        >
          <div className="swap-row">
            <TokenSelect selectedToken={fromToken} name="from" />
            <AmountInput
              hideFee={showFee}
              hideMax={true}
              amount={formattedAmounts["INPUT"]}
              setExactIn={setExactIn}
              name="INPUT"
            />
          </div>
          <div className="usd-container">
            <span>$</span>
            <b>{numberWithCommas(fromUSDBalance, 2)}</b>
          </div>
        </FormItem>
      </div>
      <Div className="center swap-block">
        <div className="delimeter"></div>
        <button className="swap-amount-btn" onClick={() => reverseTokens()}>
          <Icon icon="swap" fill={"#792EC0"} />
        </button>
        <div className="delimeter"></div>
      </Div>
      <div className="swap-column">
        <FormItem
          top={"To" + (independentField === "INPUT" ? " (estimated)" : "")}
          className="formTokenItem"
        >
          <div className="swap-row">
            <TokenSelect selectedToken={toToken} name="to" />
            <AmountInput
              setExactIn={setExactIn}
              amount={formattedAmounts["OUTPUT"]}
              name="OUTPUT"
              hideMax={false}
            />
          </div>
          <div className="usd-container">
            <span>$</span>
            <b>{numberWithCommas(toUSDBalance, 2)}</b>
          </div>
        </FormItem>
      </div>
      <FeeInfoBlock rate={rate} isExactIn={isExactIn} />
      <SwapButton isExactIn={isExactIn} formattedAmounts={formattedAmounts} />
    </Group>
  );
};
const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  swapReducer: state.swapReducer,
});

export default connect(mapStateToProps, {
  setAmount,
  setIndependentField,
  updateSwapInfo,
  setFromToken,
  setToToken,
})(Swap);
