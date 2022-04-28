import { Panel } from "@vkontakte/vkui";
import ROUTES from "../../routes";
import BondPanel from "./BondPanel";
import { setActivePage } from "../../store/actions/panelActions";
import { connect } from "react-redux";
import Header from "../uikit/Header";
import UnbondPanel from "./UnbondPanel";
import text from '../../text.json'
const ControlPanel = (props) => {
  const { liquidityMethod } = props.poolReducer;
  const method =
    liquidityMethod === "bond" ? text.BOND_TOKENS : text.UNBOND_TOKENS;
  return (
    <Panel id={ROUTES.CONTROL_BOND}>
      <Header title={method} back={true} backPanel={'pool_details'} />
      {liquidityMethod === "bond" ? <BondPanel /> : <UnbondPanel />}
    </Panel>
  );
};
const mapStateToProps = (state) => ({
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { setActivePage })(ControlPanel);
