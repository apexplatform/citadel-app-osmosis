import { useState } from "react";
import { Div } from "@vkontakte/vkui";
import { connect } from "react-redux";
import { setSelectedPool } from "../../store/actions/poolActions";
import { setActivePage } from "../../store/actions/panelActions";
import { numberWithCommas } from "../helpers/numberFormatter";
import text from "../../text.json";
import "../styles/panels/assets.css";
const AssetsBlock = (props) => {
  const { currentWallet, tokenList, usdPrices } = props.walletReducer;
  const { incentivizedPools, allPools } = props.poolReducer;
  let bondedBalance = 0;
  const { osmoPrice } = props.poolReducer;
  incentivizedPools?.map((elem) => {
    if (elem.myLockedAmount != 0) {
      bondedBalance += +elem.myLockedAmount
        .toString()
        .replace("$", "")
        .replace(",", "");
    }
  });
  let availableBalance = 0;
  allPools?.map((elem) => {
    if (+elem.availableLP.replace("$", "").replace(",", "") != 0) {
      availableBalance += +elem.availableLP
        .toString()
        .replace("$", "")
        .replace("<", "")
        .replace(",", "");
    }
  });
  tokenList?.map((elem) => {
    if (elem.balance > 0) {
      if (elem.code == "OSMO") {
        availableBalance += +elem.balance * +osmoPrice;
      } else if (elem.code == "STARS") {
        availableBalance += +elem.balance * (+usdPrices?.stargaze?.usd || 0);
      } else {
        availableBalance += +elem.balance * +elem.USD;
      }
    }
  });
  const stakedBalance = currentWallet?.balance?.stake * osmoPrice || 0;
  const totalBalance = +availableBalance + +stakedBalance + +bondedBalance;
  return (
    <Div className="pools-assets-block">
      <div className="assets-item">
        <p>{text.TOTAL_ASSETS}</p>
        <div className="assets-row">
          <span>$</span>
          <h3 className="purple-text">{numberWithCommas(totalBalance, 2)}</h3>
        </div>
      </div>
      <div className="assets-item">
        <p>{text.AVAILABLE_ASSETS}</p>
        <div className="assets-row">
          <span>$</span>
          <h3 className="pool-green-text">
            {numberWithCommas(availableBalance, 2)}
          </h3>
        </div>
      </div>
      <div className="assets-item">
        <p>{text.BONDED_ASSETS}</p>
        <div className="assets-row">
          <span>$</span>
          <h3>{numberWithCommas(bondedBalance, 2)}</h3>
        </div>
      </div>
      <div className="assets-item">
        <p>{text.STAKED_OSMO}</p>
        <div className="assets-row">
          <span>$</span>
          <h3 className="pool-blue-text">
            {numberWithCommas(stakedBalance, 2)}
          </h3>
        </div>
      </div>
    </Div>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { setActivePage, setSelectedPool })(
  AssetsBlock
);
