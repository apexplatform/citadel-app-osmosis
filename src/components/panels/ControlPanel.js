import { Panel } from "@vkontakte/vkui";
import ROUTES from "../../routes";
import AddLiquidity from "./AddLiquidity";
import RemoveLiquidity from "./RemoveLiquidity";
import { setActivePage } from "../../store/actions/panelActions";
import { connect } from "react-redux";
import Header from "../uikit/Header";
import text from '../../text.json'
const ControlPanel = (props) => {
  const { liquidityMethod } = props.poolReducer;
  const method =
    liquidityMethod === "add" ? text.ADD_LIQUIDITY : text.REMOVE_LIQUIDITY;
  return (
    <Panel id={ROUTES.CONTROL_PANEL}>
      <Header title={method} back={true} />
      {liquidityMethod === "add" ? <AddLiquidity /> : <RemoveLiquidity />}
    </Panel>
  );
};
const mapStateToProps = (state) => ({
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { setActivePage })(ControlPanel);
