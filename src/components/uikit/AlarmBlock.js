import text from "../../text.json";
import fileRoutes from "../../config/file-routes-config.json";
import "../styles/components/alarmBlock.css";
const AlarmBlock = () => {
  return (
    <div className="alarm-block">
      <img src={fileRoutes.ALARM_ICON} alt="alarm" />
      <p>{text.ALARM_TEXT}</p>
    </div>
  );
};
export default AlarmBlock;
