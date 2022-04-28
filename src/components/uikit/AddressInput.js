import { useState } from "react";
import { connect } from "react-redux";
import "../styles/components/addressInput.css";
import text from "../../text.json";
import fileRoutes from "../../config/file-routes-config.json";
import { setToAddress } from "../../store/actions/walletActions";
const AddressInput = (props) => {
  const [address, setAddress] = useState("");
  const { currentToken, networks } = props.walletReducer;
  const [hasError, setError] = useState(false);
  const isValidAddress = () => {
    const regTemplate = networks[currentToken.value]?.validating;
    if (!regTemplate) return false;
    const regExp = new RegExp(regTemplate);
    return regExp.test(address);
  };
  const checkAddress = (val) => {
    setAddress(val);
    props.setToAddress(val);
    setError(!isValidAddress());
  };
  return (
    <div className="address-input">
      <input
        className={hasError ? "error-input" : undefined}
        value={address}
        onKeyPress={(e) => checkAddress(e.target.value)}
        onBlur={(e) => checkAddress(e.target.value)}
        onChange={(e) => checkAddress(e.target.value)}
      />
      {hasError && (
        <div className="address-error-container">
          <img src={fileRoutes.ERROR_ICON} alt="error" />
          <span>{text.ERRORS.INVALID_KEY}</span>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
});

export default connect(mapStateToProps, { setToAddress })(AddressInput);
