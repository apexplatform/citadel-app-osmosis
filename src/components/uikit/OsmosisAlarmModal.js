import { ModalPage } from "@vkontakte/vkui";
import {
  setActivePanel,
  setActiveModal,
} from "../../store/actions/panelActions";
import { connect } from "react-redux";
import "../styles/components/errorModal.css";
import text from "../../text.json";
import Countdown from "react-countdown";
const Completionist = () => "";
const AlarmModal = () => {
  const end = new Date();
  const now = new Date();
  const index = now.toString().indexOf("GMT");
  const gmt = now.toString().substring(index + 3, index + 8);
  let endTime = 17;
  let endMinute = 30;
  end.setHours(
    eval(endTime + gmt.substring(0, 1) + parseInt(gmt.substring(1, 3)))
  );
  end.setMinutes(
    eval(endMinute + gmt.substring(0, 1) + parseInt(gmt.substring(3)))
  );
  const dif = end.getTime() - now.getTime();
  const renderer = ({ hours, minutes, seconds, completed }) => {
    if (completed) {
      return <Completionist />;
    } else {
      return (
        <div className="alarm-timer">
          <div>{minutes > 9 ? minutes.toString().slice(0, 1) : 0}</div>
          <div>{minutes > 9 ? minutes.toString().slice(1) : minutes}</div>
          <p>:</p>
          <div>{seconds > 9 ? seconds.toString().slice(0, 1) : 0}</div>
          <div>{seconds > 9 ? seconds.toString().slice(1) : seconds}</div>
        </div>
      );
    }
  };
  return (
    <ModalPage id="alarm" dynamicContentHeight>
      <div id="modal-header">
        <img src="img/icons/blueAlarm.svg" alt="error" />
        <p className="error-title alarm-title">{text.ALARM_MODAL_HEADER}</p>
      </div>
      <p className="error-text">{text.ALARM_MODAL_TEXT} </p>
      <div className="alarm-tips">
        <div className="alarm-tips-row">
          <img src="img/icons/tips.svg" alt="error" />
          <div>
            <h4>{text.TIP}</h4>
            <span className="tips-description">{text.ALARM_MODAL_TIP}</span>
          </div>
        </div>
        <Countdown
          date={now.getTime() + dif}
          autoStart={true}
          zeroPadDays={3}
          renderer={renderer}
        />
      </div>
    </ModalPage>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
  errorsReducer: state.errorsReducer,
});

export default connect(mapStateToProps, { setActiveModal, setActivePanel })(
  AlarmModal
);
