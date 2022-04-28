import { useState } from "react";
import { Group, Div } from "@vkontakte/vkui";
import { connect } from "react-redux";
import text from "../../text.json";
import { prepareBeginUnlockTokensTransaction } from "../../store/actions/poolActions";
import "../styles/panels/bond-control.css";
const UnbondPanel = (props) => {
  const { pool, isSuperfluidLock } = props.poolReducer;
  const [option, setOption] = useState(null);
  const [error, setError] = useState(true);

  const prepareUnbondTokens = () => {
    if (!error) {
      let isSyntheticLock = isSuperfluidLock && option.duration == 14
      props.prepareBeginUnlockTokensTransaction(option,isSyntheticLock);
    }
  };
  const checkOption = (option) => {
    if (
      +option.lockup.amount
        .maxDecimals(6)
        .trim(true)
        .toString()
        .replace(",", "") > 0
    ) {
      setOption(option);
      setError(false);
    } else {
      setOption(option);
      setError(true);
    }
  };
  return (
    <Group>
      {pool.lockDurations.map((item) => (
        <div
          className="unbond-row"
          key={item.duration}
          id={option?.duration == item.duration ? "active-option" : undefined}
          onClick={() => checkOption(item)}
        >
          <div className="unbond-column">
            <span>{text.UNBONDING_DURATION}</span>
            <p>
              {item.duration} {text.DAYS}
            </p>
          </div>
          <div className="unbond-column">
            <span>{text.CURRENT_APR}</span>
            <h3 className="blue-text">
              {item.apy} <span>%</span>
            </h3>
          </div>
          <div className="unbond-column">
            <span>{text.AMOUNT}</span>
            <h3 className="purple-text">
              {item.lockup.amount.maxDecimals(6).trim(true).toString() || 0}{" "}
              <span>GAMM/{pool.id}</span>
            </h3>
          </div>
        </div>
      ))}
      <Div
        className="control-btn"
        id={error ? "disabled-btn" : undefined}
        onClick={() => prepareUnbondTokens()}
      >
        <span>Unbond</span>
      </Div>
    </Group>
  );
};
const mapStateToProps = (state) => ({
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, {
  prepareBeginUnlockTokensTransaction,
})(UnbondPanel);
