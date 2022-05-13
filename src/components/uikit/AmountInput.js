import "../styles/components/amountInput.css";
import text from "../../text.json";
import { connect } from "react-redux";
import { numberWithCommas } from "../helpers/numberFormatter";
import {
  setRateAmount,
  updateSwapInfo,
  setSwapStatus,
  getFromBalance,
  clearRouteInfo,
  setIndependentField,
} from "../../store/actions/swapActions";
import {
  setFromAmount,
  setToAmount,
  setAmount,
} from "../../store/actions/walletActions";
import BigNumber from "bignumber.js";
const AmountInput = (props) => {
  const { currentWallet, fromToken, toToken } = props.walletReducer;
  const balance = props.getFromBalance();
  const showMax = props.hideMax || false;
  const coin = currentWallet?.code;
  const feeProcent = coin == fromToken?.code ? 0.01 : 0;
  const checkAmount = (val) => {
    val = val.replace(/[^0-9\.]/g, "");
    if(val.split(".").length - 1 !== 1 && val[val.length-1] === '.') return
    if (
      +props.amount == 0 &&
      val.length == 2 &&
      val[1] != "." &&
      val[1] == "0"
    ) {
      props.setAmount(val[0]);
    } else if (val[0] == "0" && val[1] != ".") {
      props.setAmount(BigNumber(val).toFixed());
    } else {
      props.setAmount(val);
    }
    props.setIndependentField(props.name);
    props.setExactIn(props.name === "INPUT" ? true : false);
  };
  const setMaxAmount = () => {
    if (BigNumber(balance).minus(feeProcent).toNumber() <= 0) {
      props.setAmount(0);
      props.setSwapStatus("insufficientBalance");
      props.clearRouteInfo();
    } else {
      checkAmount(BigNumber(balance).minus(feeProcent).toFixed(), true);
    }
  };
  const checkValue = (val) => {
    if (val.length == 0) {
      props.setAmount(0);
    }
  };
  return (
    <div className="amount-container">
      <div className="balance-container swap-balance">
        <h5>{text.BALANCE}: </h5>
        <span className="balance-amount">
          {props.name === "INPUT"
            ? numberWithCommas(balance)
            : numberWithCommas(toToken?.balance)}{" "}
        </span>
        <h5>{props.name === "INPUT" ? fromToken?.code : toToken?.code}</h5>
      </div>
      <div className="swap-input-container">
        <input
          value={props.amount}
          onBlur={(e) => checkValue(e.target.value)}
          onChange={(e) => checkAmount(e.target.value)}
        />
        <span className="input-currency">
          {props.name === "INPUT" ? fromToken?.code : toToken?.code}
        </span>
        {showMax && (
          <button className="max-btn" onClick={() => setMaxAmount()}>
            Max
          </button>
        )}
      </div>
      {/* {showFee &&
            <div className='fee-container'>
				<h5>{text.FEE_TEXT}</h5>
				<span className='fee-amount'>{feeProcent} </span>
				<h5>{coin}</h5>
			</div>} */}
    </div>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  swapReducer: state.swapReducer,
});

export default connect(mapStateToProps, {
  setSwapStatus,
  getFromBalance,
  clearRouteInfo,
  setIndependentField,
  setAmount,
  updateSwapInfo,
  setRateAmount,
  setFromAmount,
  setToAmount,
})(AmountInput);
