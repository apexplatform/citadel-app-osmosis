import { Card } from "@vkontakte/vkui";
import "../styles/components/poolInfoTable.css";
const PoolInfoTable = (props) => {
  const { pool } = props;
  return (
    <Card className="pool-info-table">
      <div className="pool-info-row">
        <p className="pool-table-header">Pending duration</p>
        <p className="pool-table-header">Current APY</p>
        <p className="pool-table-header-last">Amount</p>
      </div>
      <div className="separator"></div>
      {pool.lockDurations?.map((item, i) => (
        <div className="pool-info-row" key={i}>
          {item.duration === 1 ? (
            <p className="pool-info-column">a day</p>
          ) : (
            <p className="pool-info-column">{item.duration} days</p>
          )}
          <p className="grey-text pool-info-column">
            <span>{item.apy} </span>%
          </p>
          <p className="grey-text pool-info-column-last">
            <span className="purple-text">
              {item.lockup.amount.maxDecimals(6).trim(true).toString() || 0}{" "}
            </span>{" "}
            GAMM/{pool.id}
          </p>
        </div>
      ))}
    </Card>
  );
};

export default PoolInfoTable;
