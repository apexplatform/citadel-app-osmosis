import "../styles/components/inputNumber.css";
const InputNumber = (props) => {
  return (
    <div className="input-number-container" style={{ width: props.width }}>
      <input
        value={props.value}
        type="text"
        onBlur={() => props.setInputId("active-input-2")}
        id={props.idValue}
        onClick={() => props.setActive()}
        className="number-input"
        onChange={(e) => props.setValue(e.target.value)}
        onBlur={(e) => {
          e.target.value.length == 0 && props.setValue("0");
        }}
      ></input>
      <span className={props.symbol == "%" ? "procent-symbol" : undefined}>
        {props.symbol}
      </span>
    </div>
  );
};

export default InputNumber;
