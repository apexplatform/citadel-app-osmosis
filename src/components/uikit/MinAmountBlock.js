import "../styles/components/minAmountBlock.css";
const MinimumAmountBlock = (props) => {
  return (
    <div className="min-amount-block">
      <span className="min-text">Minimum:</span>
      <span className="min-amount"> {props.amount}</span>
      <span className="min-network"> {props.network}</span>
    </div>
  );
};
export default MinimumAmountBlock;
