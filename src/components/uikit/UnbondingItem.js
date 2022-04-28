import "../styles/components/unbondingItem.css";

const UnbondingItem = (props) => {
  const { item } = props
  const isSuperfluid = props.superfluid && item.duration == 14
  return (
    <div className="unbonding-item" id={isSuperfluid ? 'superfluid-item' : undefined}>
      {item.duration === 1 ? (
        <p>A day unbonding</p>
      ) : (
        <p>{item.duration} days unbonding</p>
      )}
      <span>
        APR <h4>{item.apy}</h4> %
      </span>
      {isSuperfluid && <img src='img/tokens/osmosis.svg' alt='osmo' /> }
    </div>
  );
};

export default UnbondingItem;
