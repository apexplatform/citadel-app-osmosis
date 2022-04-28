import { Div, Group } from "@vkontakte/vkui";
import "../styles/components/swapButton.css";
import { Icon20ChevronRightOutline } from "@vkontakte/icons";
import { prepareSwapTransfer } from "../../store/actions/swapActions";
import { connect } from "react-redux";
import Loader from "../uikit/Loader";
import text from "../../text.json";
import ROUTES from "../../routes";
import {
  setActivePanel,
  setPreviosPanel,
} from "../../store/actions/panelActions";
const SwapButton = (props) => {
  const { swapStatus, disableSwap } = props.swapReducer;
  const { fromToken } = props.walletReducer;
  return (
    <Group>
      {disableSwap ? (
        <Div className="swap-btn" id="disabled-btn">
          <span>{text.SWAP}</span>
        </Div>
      ) : (
        <div>
          {swapStatus == "swapAnyway" && (
            <Div
              className="swapAnyway-alarm"
              onClick={() => {
                props.setActivePanel(ROUTES.SETTINGS);
                props.setPreviosPanel(ROUTES.SWAP);
              }}
            >
              <span>
                {text.SWAP_ANYWAY_ALARM}{" "}
                <span className="bold-span">{text.SETTINGS}</span>
              </span>
              <Icon20ChevronRightOutline
                fill="#E5457A"
                width={26}
                height={26}
              />
            </Div>
          )}
          {swapStatus == "swap" && (
            <Div
              className="swap-btn"
              onClick={() =>
                props.prepareSwapTransfer(
                  props.isExactIn,
                  props.formattedAmounts
                )
              }
            >
              <span>{text.SWAP}</span>
            </Div>
          )}
          {swapStatus == "swapAnyway" && (
            <Div className="swap-btn" id="disabled-btn">
              <span>{text.SWAP}</span>
            </Div>
          )}
          {swapStatus == "loading" && (
            <Div className="swap-btn loading-btn" id="disabled-btn">
              <Loader />
              <span>{text.LOADING}</span>
            </Div>
          )}
          {swapStatus == "feeError" && (
            <Div className="swap-btn" id="disabled-btn">
              <span>{text.FEE_ERROR_TEXT}</span>
            </Div>
          )}
          {swapStatus == "unavailable" && (
            <Div className="swap-btn" id="disabled-btn">
              <span>There is no swap pair</span>
            </Div>
          )}
          {swapStatus == "insufficientBalance" && (
            <Div className="swap-btn" id="disabled-btn">
              <span>Insufficient {fromToken?.symbol} balance </span>
            </Div>
          )}
          {swapStatus == "enterAmount" && (
            <Div className="swap-btn" id="disabled-btn">
              <span>{text.ENTER_AMOUNT}</span>
            </Div>
          )}
        </div>
      )}
    </Group>
  );
};
const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  swapReducer: state.swapReducer,
});

export default connect(mapStateToProps, {
  setPreviosPanel,
  setActivePanel,
  prepareSwapTransfer,
})(SwapButton);
