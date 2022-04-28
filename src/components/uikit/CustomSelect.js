import "../styles/components/customSelect.css";
import { Icon16Dropdown } from "@vkontakte/icons";
import { connect } from "react-redux";
import { CustomSelectOption } from "@vkontakte/vkui";
import { useState } from "react";
const CustomSelect = (props) => {
  const { methods } = props;
  const [value, setValue] = useState(methods[0]);
  const [close, setClose] = useState(false);
  return (
    <div className="select-container">
      <div className="select-row" onClick={() => setClose(!close)}>
        <span className="select-value">{value.label}</span>
        <Icon16Dropdown
          className="select-dropdawn-icon"
          fill="#C5D0DB"
          width={25}
          height={25}
        />
      </div>
      {close && (
        <div className="select-dropdawn">
          {methods.map((item) => (
            <CustomSelectOption
              onClick={() => {
                setValue(item);
                setClose(false);
              }}
              className="custom-select-option"
            >
              {item.label}
            </CustomSelectOption>
          ))}
        </div>
      )}
    </div>
  );
};
const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
});

export default connect(mapStateToProps, {})(CustomSelect);
