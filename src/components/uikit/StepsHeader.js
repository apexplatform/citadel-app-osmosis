import "../styles/components/header.css";
import { Config } from "../../config/config";
import { Icon24Back } from "@vkontakte/icons";
import { connect } from "react-redux";
import { setActivePage } from "../../store/actions/panelActions";
const StepsHeader = (props) => {
  const config = new Config();
  const getStatusId = (id) => {
    if (props.activeOption > id) {
      return "passed-circle-color";
    } else if (props.activeOption == id) {
      return "active-line-color";
    } else {
      return undefined;
    }
  };
  const prevStep = () => {
    props.setActiveOption(props.activeOption - 1);
  };
  const nextStep = (step) => {
    props.setActiveOption(step);
  };
  return (
    <div
      className="header"
      style={{ background: config.headerParamsFromConfig("BACKGROUND_COLOR") }}
    >
      <div className="header-line"></div>
      <div className="header-row">
        {props.activeOption > 1 && (
          <div className="header-back-row" onClick={() => prevStep()}>
            <Icon24Back fill="#818C99" />
            {config.headerParamsFromConfig("BACK_TITLE")}
          </div>
        )}
        <div className="steps-row">
          <p id={getStatusId(1)} onClick={() => nextStep(1)}>
            1
          </p>
          <div
            className="steps-line"
            id={props.activeOption == 1 ? "active-line-color" : undefined}
          ></div>
          <p id={getStatusId(2)} onClick={() => nextStep(2)}>
            2
          </p>
          <div
            className="steps-line"
            id={props.activeOption == 2 ? "active-line-color" : undefined}
          ></div>
          <p id={getStatusId(3)} onClick={() => nextStep(3)}>
            3
          </p>
        </div>
      </div>
    </div>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
});

export default connect(mapStateToProps, { setActivePage })(StepsHeader);
