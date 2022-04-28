import { Group, FormItem, Div, Avatar } from "@vkontakte/vkui";
import { Icon20ChevronRightOutline } from "@vkontakte/icons";
import { connect } from "react-redux";
import text from "../../text.json";
import fileRoutes from "../../config/file-routes-config.json";
import { setSelectedTokens } from "../../store/actions/poolActions";
import PoolPercentInput from "../uikit/PoolPercentInput";
import { useEffect, useState } from "react";
const SecondStepPanel = (props) => {
  const { selectedTokens } = props.poolReducer;
  const [error, setError] = useState(false);
  const [tokens, setTokens] = useState(selectedTokens);
  useEffect(() => {
    tokens.map((elem) => {
      if (elem.amount <= 0) {
        setError(text.EMPTY_BALANCE);
      }
    });
  }, []);
  const setAmount = (code, val) => {
    setError(false);
    let temp = tokens.map((item) => {
      if (item.token.code == code) {
        if (+val > item.token.balance && code != "OSMO") {
          setError(text.ERRORS.INSUFFICIENT_FUNDS);
          item.amount = +val;
        } else if (code == "OSMO" && item.token.balance < 100) {
          item.amount = -1;
        } else {
          item.amount = +val;
          setError(false);
        }
      }
      return item;
    });
    temp.map((elem) => {
      if (elem.amount == 0) {
        setError(text.EMPTY_BALANCE);
      }
      if (elem.amount < 0) {
        setError(text.ERRORS.INSUFFICIENT_FUNDS);
      }
    });
    setTokens(temp);
  };
  const nextStep = () => {
    if (!error) {
      props.setSelectedTokens(tokens);
      props.setActiveOption(3);
    }
  };
  return (
    <Group className="first-step-block">
      {tokens?.map((item, i) => (
        <div className="swap-column pool-percent-row" key={i}>
          <FormItem top={"Pool shares #" + (i + 1)} className="formTokenItem">
            <div className="swap-row token-liquidity-row">
              <Avatar
                size={24}
                className="token-logo"
                src={item.token.logoURI}
              />
              <div className="select-block pool-token-row">
                <p>{item.token.name}</p>
                <span>
                  (<h2>{item.percent}</h2>%)
                </span>
                <Icon20ChevronRightOutline
                  fill="#C5D0DB"
                  width={25}
                  height={25}
                />
              </div>
              <PoolPercentInput
                amount={item.amount}
                setPercent={setAmount}
                name="amount"
                balance={item.token.balance}
                code={item.token.code}
                symbol={item.token.code}
                className="amount-block"
                id={i}
              />
            </div>
          </FormItem>
        </div>
      ))}
      {error ? (
        <Div className="error-text-div">
          <img src={fileRoutes.ERROR_ICON_2} alt="add" />
          <p>{error}</p>
        </Div>
      ) : (
        ""
      )}
      <Div
        className="swap-btn"
        id={error ? "disabled-btn" : undefined}
        onClick={() => nextStep()}
      >
        <span>{text.NEXT}</span>
      </Div>
    </Group>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { setSelectedTokens })(SecondStepPanel);
