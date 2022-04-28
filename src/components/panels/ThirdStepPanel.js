import { useState } from "react";
import { Group, Div, Avatar, FormItem, Checkbox } from "@vkontakte/vkui";
import { connect } from "react-redux";
import fileRoutes from "../../config/file-routes-config.json";
import text from "../../text.json";
import PoolPercentInput from "../uikit/PoolPercentInput";
import { prepareCreatePool } from "../../store/actions/poolActions";
import TokenInfoCard from "../uikit/TokenInfoCard";
const ThirdStepPanel = (props) => {
  const { selectedTokens } = props.poolReducer;
  const { currentWallet } = props.walletReducer;
  const [confirmed, setConfirmed] = useState(false);
  const [swapFee, setSwapFee] = useState(0);
  const setSwapFeeValue = (id = null, percent) => {
    setSwapFee(percent);
  };
  const prepareCreatePool = () => {
    if (confirmed && currentWallet.balance > 100) {
      props.prepareCreatePool(swapFee);
    }
  };
  return (
    <Group className="first-step-block">
      {selectedTokens.map((item, i) => (
        <TokenInfoCard item={item} key={i} symbol={"%"} />
      ))}
      <FormItem top="Swap fee" className="formTokenItem pool-third-fee">
        <PoolPercentInput
          symbol="%"
          name="swapFee"
          setPercent={setSwapFeeValue}
        />
      </FormItem>
      <Checkbox
        onClick={(e) => {
          setConfirmed(e.target.checked);
        }}
      >
        {text.POOL_CREATE_CONFIRM} <span style={{ fontWeight: 500 }}>100</span>{" "}
        OSMO
      </Checkbox>
      {currentWallet.balance < 100 ? (
        <Div className="error-text-div">
          <img src={fileRoutes.ERROR_ICON_2} alt="add" />
          <p>{text.ERRORS.INSUFFICIENT_FUNDS}</p>
        </Div>
      ) : (
        ""
      )}
      <Div
        className="swap-btn"
        id={
          !confirmed || currentWallet.balance < 100 ? "disabled-btn" : undefined
        }
        onClick={() => prepareCreatePool()}
      >
        <span>{text.CREATE_POOL}</span>
      </Div>
    </Group>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { prepareCreatePool })(ThirdStepPanel);
