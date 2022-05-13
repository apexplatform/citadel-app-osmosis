import { useState } from "react";
import "../styles/components/poolAmountInput.css";
import text from "../../text.json";
import { connect } from "react-redux";
import BigNumber from "bignumber.js";
const PoolAmountInput = (props) => {
  const [amount, updateAmount] = useState(0);
  const [currencyOffset, setCurrencyOffset] = useState(
    (amount?.toString().length + 1) * 8 || 30
  );
  const showMax = props.hideMax || false;
  const { pool } = props.poolReducer;
  const checkAmount = (val) => {
    val = val.replace(/[^0-9\.]/g, "");
    if(val.split(".").length - 1 !== 1 && val[val.length-1] === '.') return
    if (+amount == 0 && val.length == 2 && val[1] != "." && val[1] == "0") {
      props.setAmount(val[0]);
      updateAmount(val[0]);
      setCurrencyOffset((val[0].toString().length + 1) * 8);
    } else if (val[0] == "0" && val[1] != ".") {
      props.setAmount(BigNumber(val).toFixed());
      updateAmount(BigNumber(val).toFixed());
      setCurrencyOffset((BigNumber(val).toString().length + 1) * 8);
    } else {
      props.setAmount(val);
      updateAmount(val);
      setCurrencyOffset((val.toString().length + 1) * 8);
    }
  };
  const setMaxAmount = () => {
    if (pool.gammShare) {
      props.setAmount(pool.gammShare?.maxDecimals(6).toString(), true);
      updateAmount(pool.gammShare?.maxDecimals(6).toString());
      setCurrencyOffset(
        (pool.gammShare?.maxDecimals(6).toString().length + 1) * 8 || 30
      );
    } else {
      props.setAmount(0, true);
      updateAmount(0);
      setCurrencyOffset(15);
    }
  };
  return (
    <div className="pool-amount-container">
      {!props.hideLp && (
        <p className="my-liquidity-text">
          {text.MY_LIQUIDITY}:{" "}
          <span>{pool.gammShare?.maxDecimals(6).toString() || 0} </span>
          {props.symbol}
        </p>
      )}
      {props.hideLp && (
        <div className="balance-container">
          <h5>{text.BALANCE}: </h5>
          <span className="balance-amount">
            {pool.gammShare?.maxDecimals(6).toString() || 0}
          </span>
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
        {!showMax && (
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

export default connect(mapStateToProps, {})(PoolAmountInput);
