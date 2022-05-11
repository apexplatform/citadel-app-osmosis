import { Group, Div, Button } from "@vkontakte/vkui";
import Header from "../uikit/Header";
import { connect } from "react-redux";
import "../styles/panels/settings.css";
import { useState, useEffect } from "react";
import { setSlippageTolerance } from "../../store/actions/swapActions";
import fileRoutes from "../../config/file-routes-config.json";
import text from "../../text.json";
import BigNumber from "bignumber.js";
import InputNumber from "../uikit/InputNumber";
import { setActivePanel } from "../../store/actions/panelActions";
const Settings = (props) => {
  const { slippageTolerance } = props.swapReducer;
  const [inputId, setInputId] = useState("default-input");
  const procent = [1, 3, 5];
  const [currentProcent, setCurrentProcent] = useState(
    procent.includes(+slippageTolerance) ? "0" : slippageTolerance
  );
  const [isButtonOption, setButtonOption] = useState(true);
  const [currentProcent2, setCurrentProcent2] = useState(slippageTolerance);
  const { previousPanel } = props.panelReducer;
  const [IDname, setIDname] = useState("initial-procent");
  const save = () => {
    if (currentProcent) {
      isButtonOption
        ? props.setSlippageTolerance(+currentProcent2)
        : props.setSlippageTolerance(+currentProcent);
    } else {
      setCurrentProcent(0);
      props.setSlippageTolerance(0);
    }
    setIDname("initial-procent");
    props.setActivePanel(previousPanel);
  };
  const setSlippageProcent = (val) => {
    val = val.replace(/[^0-9\.]/g, "");
    if (
      +currentProcent == 0 &&
      val.length == 2 &&
      val[1] != "." &&
      val[1] == "0"
    ) {
      setCurrentProcent(val[0]);
    } else if (val[0] == "0" && val[1] != ".") {
      setCurrentProcent(BigNumber(+val).toFixed());
    } else {
      setCurrentProcent(val);
    }
    setButtonOption(false);
  };
  const activeProcent = (item) => {
    setCurrentProcent2(item);
    setButtonOption(true);
    setIDname("active-procent");
    setInputId("default-input");
  };
  const setProcentActive = () => {
    setInputId("active-input");
    setCurrentProcent2(0);
  };

  useEffect(() => {
    let flag = false;
    procent.map((el) => {
      if (el == slippageTolerance) {
        flag = true;
      }
    });
    if (!flag) {
      setInputId("active-input-2");
    } else {
      setInputId("default-input");
    }
  }, []);

  return (
    <Group className="settings-panel">
      <Header title="Settings" showTitle={true} />
      <Div className="manage-address-text">
        <h4>{text.SETTING_TITLE}</h4>
        <p>{text.SETTING_DESCRIPTION} </p>
      </Div>
      <Div className="add-address-btn">
        <img src={fileRoutes.ADD_ICON} alt="add" />
        <p>{text.ADD_ADDRESS}</p>
      </Div>
      <Div className="coming-soon">
        <h2>{text.COMING_SOON}</h2>
      </Div>
      <Div>
        <h4>{text.SLIPPAGE_TOLERANCE}</h4>
        <div className="procent-row">
          {procent.map((item) => (
            <button
              key={item}
              id={currentProcent2 === item ? IDname : undefined}
              className="procent-btn"
              onClick={() => activeProcent(item)}
            >
              {item} <span>%</span>
            </button>
          ))}
          <InputNumber
            symbol="%"
            width="23%"
            value={currentProcent}
            idValue={inputId}
            setActive={setProcentActive}
            setInputId={setInputId}
            setValue={setSlippageProcent}
          />
        </div>
      </Div>
      <Div>
        <Button stretched size="l" onClick={() => save()} className="save-btn">
          {text.SAVE}
        </Button>
      </Div>
    </Group>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  swapReducer: state.swapReducer,
  panelReducer: state.panelReducer,
});

export default connect(mapStateToProps, {
  setActivePanel,
  setSlippageTolerance
})(Settings);
