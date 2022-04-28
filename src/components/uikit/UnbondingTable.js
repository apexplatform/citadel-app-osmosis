import { Card } from "@vkontakte/vkui";
import "../styles/components/poolInfoTable.css";
import moment from "moment";
import { prepareUnlockTokensTransaction } from "../../store/actions/poolActions";
import dayjs from "dayjs";
import { connect } from "react-redux";
const UnbondingsTable = (props) => {
  const { pool } = props;
  const getTime = (item) => {
    const endTimeMoment = moment(item.endTime);
    return endTimeMoment;
  };
  return (
    <Card className="pool-info-table unbondings-table">
      <div className="pool-info-row">
        <p className="pool-table-header">Unbonding duration</p>
        <p className="pool-table-header">Amount</p>
        <p className="pool-table-header">Action</p>
      </div>
      <div className="separator"></div>
      {pool.unlockingDatas?.map((item, i) => (
        <div className="pool-info-row" key={i}>
          {item.duration === 1 ? (
            <p>a day</p>
          ) : (
            <p>{item.duration.asDays()} days</p>
          )}
          <p className="grey-text">
            <span className="purple-text">
              {item.amount?.maxDecimals(6).trim(true).toString() || 0}{" "}
            </span>{" "}
            GAMM/{pool.id}
          </p>
          {getTime(item).isBefore(dayjs()) ? (
            <p>
              <button
                className="unbond-btn"
                onClick={() =>
                  props.prepareUnlockTokensTransaction(item.lockIds.slice(0, 3))
                }
              >
                Unbond all
              </button>
            </p>
          ) : (
            <p className="grey-text">{getTime(item).fromNow()}</p>
          )}
        </div>
      ))}
    </Card>
  );
};

const mapStateToProps = (state) => ({
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { prepareUnlockTokensTransaction })(
  UnbondingsTable
);
