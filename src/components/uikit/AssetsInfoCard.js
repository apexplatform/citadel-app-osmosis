import { Div, Avatar } from "@vkontakte/vkui";
import { setSelectedPool } from "../../store/actions/poolActions";
import { setActivePage } from "../../store/actions/panelActions";
import { connect } from "react-redux";
import ROUTES from "../../routes";
import { prettyNumber } from "../helpers/numberFormatter";
const AssetsInfoCard = (props) => {
  const item = props.item;
  let usdBalance = 0;
  if (props.name == "pool-assets") {
    usdBalance = item?.usdBalance;
  } else {
    usdBalance =
      +item?.usdBalance?.toFixed(2) == "0.00"
        ? "~0"
        : +item?.usdBalance?.toFixed(2);
  }
  const setPool = (item) => {
    props.setActivePage(ROUTES.POOL_DETAILS);
    props.setSelectedPool(item);
  };
  return (
    <Div className="pool-third-item">
      <div className="row-center">
        <img className="pool-token-logo" src={item.logoURI} />
        <div className="pool-third-column-1">
          <span>{item.name || "Token"}</span>
          <p>{props.name ? item.symbol : item.code}</p>
        </div>
      </div>
      <div className="pool-third-column-2">
        <div>
          <div className="error-text-div">
            <h2>{prettyNumber(item.balance)} </h2>
            <span> {item.code}</span>
          </div>
          <p>
            {usdBalance} <span> {props.symbol}</span>
          </p>
        </div>
        {props.manage && (
          <button onClick={() => setPool(item.pool)} className="unbond-btn">
            Manage
          </button>
        )}
      </div>
    </Div>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { setActivePage, setSelectedPool })(
  AssetsInfoCard
);
