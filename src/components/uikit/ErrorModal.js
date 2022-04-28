import { ModalPage } from "@vkontakte/vkui";
import {
  setActivePanel,
  setActiveModal,
} from "../../store/actions/panelActions";
import { connect } from "react-redux";
import "../styles/components/errorModal.css";
import text from "../../text.json";
const ErrorModal = (props) => {
  const { networkErrors, validationErrors } = props.errorsReducer;
  return (
    <ModalPage id="errors" dynamicContentHeight onClose={() => networkErrors?.text ? props.setActiveModal(null) : null}>
      <div id="modal-header">
        {!validationErrors?.header ? (
          <img src="img/icons/errorModal.svg" alt="error" />
        ) : (
          <img src="img/icons/blueAlarm.svg" alt="error" />
        )}
        {networkErrors?.text ? (
          <p className="error-title"> {text.ERROR_HEADER}</p>
        ) : (
          <p className="error-title">{validationErrors?.header}</p>
        )}
      </div>
      <p className="error-text">
        {networkErrors?.text || validationErrors?.text}{" "}
        <span>{validationErrors?.text && "Citadel.one"}</span>
      </p>
      <p className="error-description">
        {networkErrors?.description || validationErrors?.description}
      </p>
      <div className="error-tips">
        <img src="img/icons/tips.svg" alt="error" />
        <div>
          <h4>{text.TIP}</h4>
          <span className="tips-description">
            {networkErrors?.tip || validationErrors?.tip}
          </span>
        </div>
      </div>
      `
    </ModalPage>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
  errorsReducer: state.errorsReducer,
});

export default connect(mapStateToProps, { setActiveModal, setActivePanel })(
  ErrorModal
);
