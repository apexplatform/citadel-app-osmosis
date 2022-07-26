import { Card } from "@vkontakte/vkui";
import { connect } from "react-redux";
import "../styles/components/tokenItem.css";
import {
  setSelectedToken,
  setFromToken,
  setToToken,
} from "../../store/actions/walletActions";
import { setActivePage } from "../../store/actions/panelActions";
import ROUTES from "../../routes";
import { prettyNumber } from "../helpers/numberFormatter";

const TokenItem = (props) => {
  const { currentToken, currentWallet } = props.walletReducer;
  let balance =
    props.item.symbol === currentWallet.code
      ? currentWallet?.balance?.mainBalance
      : props.item.balance;

  const selectToken = (item) => {
    if (currentToken === "from") {
      props.setFromToken(item);
    } else {
      props.setToToken(item);
    }
    props.setActivePage(ROUTES.HOME);
  };

  return (
    <Card className={"token-card"} onClick={() => selectToken(props.item)}>
      <div className="token-item">
        <div className="token-icon center">
          <img
            src={props.item.logoURI || "img/icons/unsupported.svg"}
            alt="icon"
          />
        </div>
        <div className="token-content">
          <p className="token-name">{props.item.name}</p>
        </div>
        {props.withAmount && (
          <div className="token-amount-block">
            <p className="token-symbol">{prettyNumber(balance || 0)}</p>
            <span>{props.item.code}</span>
          </div>
        )}
      </div>
    </Card>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
});

export default connect(mapStateToProps, {
  setFromToken,
  setToToken,
  setActivePage,
  setSelectedToken,
})(TokenItem);
