import "../styles/components/unbondingPeriod.css";

const UnbondingPeriod = (props) => {
  const { item, activeOption } = props;
  const isSuperfluid = props.superfluid && item.duration == 14
  return (
    <div
      className="unbonding-period"

      onClick={() => props.setActiveOption(item)}
      id={activeOption?.duration == item.duration ? "active-period" : isSuperfluid ? 'superfluid-item' : undefined}
    >
      <div>
        <p className="unbonding-circle">
          <span className="unbonding-circle-inner"></span>
        </p>
      </div>
      <div>
        {item.duration === 1 ? (
          <p>A day unbonding</p>
        ) : (
          <p>{item.duration} days unbonding</p>
        )}
        <span className="unbonding-grey-text">
          APR <h4 className="unbonding-purple-text">{item.apy}</h4> %
        </span>
        {isSuperfluid && <img src='img/tokens/osmosis.svg' alt='osmo' /> }
      </div>
    </div>
  );
};

export default UnbondingPeriod;
