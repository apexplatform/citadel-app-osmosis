import { useState } from "react";
import "../styles/components/poolAmountInput.css";
import { connect } from "react-redux";
import BigNumber from "bignumber.js";
import text from "../../text.json";
const PoolPercentInput = (props) => {
  const [amount, updateAmount] = useState(props.amount || 0);
  const [currencyOffset, setCurrencyOffset] = useState(
    (amount?.toString().length + 1) * 8 || 30
  );
  const checkAmount = (val) => {
    val = val.replace(/[^0-9\.]/g, "");
    if (+amount == 0 && val.length == 2 && val[1] != "." && val[1] == "0") {
      props.setPercent(props.code, val[0]);
      updateAmount(val[0]);
      setCurrencyOffset((val[0].toString().length + 1) * 8);
    } else if (val[0] == "0" && val[1] != ".") {
      props.setPercent(props.code, BigNumber(val).toFixed());
      updateAmount(BigNumber(val).toFixed());
      setCurrencyOffset((BigNumber(val).toString().length + 1) * 8);
    } else {
      props.setPercent(props.code, val);
      updateAmount(val);
      setCurrencyOffset((val.toString().length + 1) * 8);
    }
  };
  const setMaxAmount = () => {
    if (props.code == "OSMO") {
      let balance = props.balance - 100;
      updateAmount(balance > 0 ? balance : props.balance);
      props.setPercent(props.code, balance > 0 ? balance : props.balance);
      setCurrencyOffset(
        ((balance > 0 ? balance : props.balance).toString().length + 1) * 8
      );
    } else {
      updateAmount(props.balance);
      props.setPercent(props.code, props.balance);
      setCurrencyOffset((props.balance.toString().length + 1) * 8);
    }
  };
  return (
    <div className="pool-amount-container">
      {props.name == "amount" && (
        <div className="balance-container">
          <h5>{text.BALANCE}: </h5>
          <span className="balance-amount">{props.balance} </span>
          <h5>{props.symbol}</h5>
        </div>
      )}
      <div className="pool-input-container">
        <input value={amount} onChange={(e) => checkAmount(e.target.value)} />
        <span
          className="input-currency"
          style={{ left: `${currencyOffset}px` }}
        >
          {props.symbol}
        </span>
        {props.name == "percent" && (
          <img
            src="img/icons/remove.svg"
            onClick={() => props.removeToken(props.index)}
            alt="remove"
          />
        )}
        {props.name == "amount" && (
          <button className="max-btn" onClick={() => setMaxAmount()}>
            Max
          </button>
        )}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, {})(PoolPercentInput);
