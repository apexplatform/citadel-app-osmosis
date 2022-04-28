import ROUTES from "./routes";
import Swap from "./components/containers/Swap";
import Transactions from "./components/containers/Transactions";
import { View, Group, Panel } from "@vkontakte/vkui";
import { setActivePanel } from "./store/actions/panelActions";
import { connect } from "react-redux";
import Tabbar from "./components/uikit/Tabbar";
import AddressBlock from "./components/uikit/AddressBlock";
import { Config } from "./config/config";
import CreatePool from "./components/containers/CreatePool";
import Settings from "./components/containers/Settings";
import Pool from "./components/containers/Pool";
import Assets from "./components/containers/Assets";
import DepositWithdraw from './components/containers/Deposit';
import { useEffect } from "react";

const MainPanel = (props) => {
  const { activePanel } = props.panelReducer;
  const { swapInfo } = props.swapReducer
  const config = new Config();
  useEffect(() => {
    window.addEventListener("message", (event) => {
      if(event.data == 'getSwapInfo'){
        event.source.postMessage(swapInfo, event.origin);
      }
    }, false);
  },[swapInfo])
  return (
    <Panel id={ROUTES.HOME}>
      <Group>
        <View activePanel={activePanel}>
          <Panel id={ROUTES.SWAP}>
            <Swap />
            {config.showAddressBlock && <AddressBlock />}
            <Tabbar />
          </Panel>
          <Panel id={ROUTES.POOL}>
            <Pool />
            {config.showAddressBlock && <AddressBlock />}
            <Tabbar />
          </Panel>
          <Panel id={ROUTES.CREATE_POOL}>
            <CreatePool />
            {config.showAddressBlock && <AddressBlock />}
            <Tabbar />
          </Panel>
          <Panel id={ROUTES.ASSETS}>
            <Assets />
            {config.showAddressBlock && <AddressBlock />}
            <Tabbar />
          </Panel>
          <Panel id={ROUTES.GUIDE}>
            <DepositWithdraw />
            {config.showAddressBlock && <AddressBlock />}
            <Tabbar />
          </Panel>
          <Panel id={ROUTES.TRANSACTIONS}>
            <Transactions />
            {config.showAddressBlock && <AddressBlock />}
            <Tabbar />
          </Panel>
          <Panel id={ROUTES.SETTINGS}>
            <Settings />
            <Tabbar />
          </Panel>
        </View>
      </Group>
    </Panel>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
  swapReducer: state.swapReducer,
});

export default connect(mapStateToProps, { setActivePanel })(MainPanel);


