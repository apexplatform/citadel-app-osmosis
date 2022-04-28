import { useState } from "react";
import "../styles/components/infoView.css";
import fileRoutes from "../../config/file-routes-config.json";
const InfoView = (props) => {
  const [showText, setShowText] = useState(false);
  return (
    <div className="info-view">
      <img
        src={fileRoutes.INFO_ICON}
        onMouseOver={() => setShowText(true)}
        onMouseLeave={() => setShowText(false)}
        alt="info"
      />
      {showText && (
        <div className="info-text">
          <p>{props.text}</p>
        </div>
      )}
    </div>
  );
};

export default InfoView;
