import ROUTES from "../../routes";
import { Panel } from "@vkontakte/vkui";
import PoolDetails from "./PoolDetails";
import { setActivePage } from "../../store/actions/panelActions";
import { connect } from "react-redux";
import AddressBlock from '../uikit/AddressBlock';
import Header from "../uikit/Header";
import Tabbar from "../uikit/Tabbar";
const PoolDetailsPanel = (props) => {
  const { pool } = props.poolReducer;
  let headerTitle = "Pool #" + pool.id + " ";
  pool.poolInfo.map((item, i) => {
    if (i == pool.poolInfo.length - 1) {
      headerTitle += item.symbol;
    } else {
      headerTitle += item.symbol + "/";
    }
  });

  return (
    <Panel id={ROUTES.POOL_DETAILS}>
      <Header title={headerTitle} openPools={true} back={true} />
      <PoolDetails />
      <AddressBlock />
      <Tabbar />
    </Panel>
  );
};

const mapStateToProps = (state) => ({
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { setActivePage })(PoolDetailsPanel);
