import "../styles/components/transactionsItem.css";
import moment from "moment";
import fileRoutes from "../../config/file-routes-config.json";
import text from "../../text.json";
import BigNumber from "bignumber.js";
const TransactionItem = ({ data }) => {
  let type = data.type?.value.toLowerCase();
  let statusClass = () => {
    if (data.status?.value) {
      if (data.type?.value === "stake") {
        return "transactions-amount-stake";
      }
      return "transactions-amount-send";
    } else {
      return "transactions-amount-error";
    }
  };
  let typeImg = () => {
    if (type?.includes("swap")) {
      return fileRoutes.ICONS_FOLDER + "swap.svg";
    } else if (type?.includes("approve")) {
      return fileRoutes.ICONS_FOLDER + "approve.svg";
    } else if (type) {
      return fileRoutes.ICONS_FOLDER + type + ".svg";
    } else {
      return fileRoutes.ICONS_FOLDER + type + "-error.svg";
    }
  };
  const formatFee = (fee) => {
    if (fee?.length) {
      return fee.substr(0, 7);
    }
    if (fee == undefined) {
      return 0;
    }
    return fee;
  };
  return (
    <div className="transactions-item">
      <div className="transactions-row">
        <img src={typeImg()} alt="type" className="transaction-type-img" />
        <div className="transactions-column-1">
          <div className="transactions-row">
            <h5 className="transaction-type-text">
              {type?.includes("swap") ? "Swap" : data.type?.value}
            </h5>
            {data.status?.value == "Success" ? (
              <img src={fileRoutes.SUCCESS_ICON} alt="type" />
            ) : (
              <img src={fileRoutes.ERROR_ICON} alt="type" />
            )}
          </div>
          <p className="gray-text">{moment(data.date?.value).fromNow()}</p>
        </div>
      </div>
      <div className="transactions-column-2">
        <div className="transactions-row">
          <h5
            className={statusClass() + " transactions-amount"}
            id={+data.amount?.value?.amount < 0 ? "red-amount-text" : undefined}
          >
            {BigNumber(data.amount?.value?.amount).toFixed()}
          </h5>
          <p className="transactions-net">{data.amount?.value?.ticker}</p>
        </div>
        <div className="transactions-fee-row">
          <p className="gray-text">Fee:</p>
          <h5 className="transactions-fee">
            {formatFee(data.fee?.value?.amount)}
          </h5>
          <p className="gray-text">{data.fee?.value?.ticker || "OSMO"}</p>
        </div>
      </div>
    </div>
  );
};

export default TransactionItem;
