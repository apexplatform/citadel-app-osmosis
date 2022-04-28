import { useState } from "react";
import {
  Group,
  Div,
  FormItem,
  CustomSelect,
  CustomSelectOption,
  Avatar,
} from "@vkontakte/vkui";
import { connect } from "react-redux";
import fileRoutes from "../../config/file-routes-config.json";
import text from "../../text.json";
import PoolPercentInput from "../uikit/PoolPercentInput";
import { setSelectedTokens } from "../../store/actions/poolActions";
const FirstStepPanel = (props) => {
  const { selectedTokens } = props.poolReducer;
  const { tokenList, currentWallet } = props.walletReducer;
  const [tokens, setTokens] = useState(selectedTokens || []);
  const [percentError, setPercentError] = useState(false);
  const removeToken = (index) => {
    setTokens(tokens.filter((elem, i) => i != index));
  };
  const tokenOptions = [];
  tokenList?.map((item) => {
    tokenOptions.push({
      label: item.name,
      value: item.code,
      logo: item.logoURI,
      token: item,
    });
  });
  const setPercent = (code, percent) => {
    let sum = 0;
    const temp = tokens.map((elem) => {
      if (elem.token.code == code) {
        elem.percent = percent;
      }
      if (elem.token.code == currentWallet.code) {
        elem.token.balance = currentWallet?.balance?.mainBalance;
      }
      sum += +elem.percent;
      return elem;
    });
    setPercentError(sum < 100 || sum > 100);
    setTokens(temp);
  };
  const setSelectedToken = (index, value) => {
    const item = tokenOptions.find((elem) => elem.value == value);
    const temp = tokens.map((elem, i) => {
      if (i == index) {
        elem.token = item.token;
        elem.code = value;
      }
      return elem;
    });
    setTokens(temp);
  };
  const nextStep = () => {
    if (tokens.length >= 2 && !percentError) {
      props.setSelectedTokens(tokens);
      props.setActiveOption(2);
    }
  };
  const addTokens = () => {
    setPercentError(true);
    const item = tokenList?.filter(
      ({ code: code1 }) => !tokens.some(({ code: code2 }) => code2 === code1)
    );
    setTokens([
      ...tokens,
      { percent: 0, amount: 0, token: item[0], code: item[0]?.code },
    ]);
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
              <CustomSelect
                className="select-block"
                options={tokenOptions}
                value={item.token.code}
                onChange={(e) => setSelectedToken(i, e.target.value)}
                renderOption={({ option, ...restProps }) => (
                  <CustomSelectOption
                    {...restProps}
                    key={option.value}
                    before={<Avatar size={24} src={option.logo} />}
                  />
                )}
              />
              <PoolPercentInput
                index={i}
                amount={item.percent}
                code={item.code}
                name="percent"
                symbol={"%"}
                setPercent={setPercent}
                removeToken={removeToken}
                className="amount-block"
              />
            </div>
          </FormItem>
        </div>
      ))}
      <Div
        className="add-address-btn"
        id="active-block"
        onClick={() => {
          addTokens();
        }}
      >
        <img src={fileRoutes.ADD_ICON} alt="add" />
        <p>{text.ADD_NEW_TOKEN}</p>
      </Div>
      {tokens.length < 2 && (
        <Div className="error-text-div">
          <img src={fileRoutes.ERROR_ICON_2} alt="add" />
          <p>{text.MINIMUM_ASSETS_ERROR}</p>
        </Div>
      )}
      {tokens.length >= 2 && percentError ? (
        <Div className="error-text-div">
          <img src={fileRoutes.ERROR_ICON_2} alt="add" />
          <p>{text.PERCENT_ERROR}</p>
        </Div>
      ) : (
        ""
      )}
      <Div
        className="swap-btn"
        id={tokens.length >= 2 && !percentError ? undefined : "disabled-btn"}
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

export default connect(mapStateToProps, { setSelectedTokens })(FirstStepPanel);
