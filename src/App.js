import { useEffect } from "react";
import { View, AdaptivityProvider, AppRoot, ModalRoot } from "@vkontakte/vkui";
import "@vkontakte/vkui/dist/vkui.css";
import MainPanel from "./MainPanel";
import ROUTES from "./routes";
import TransactionDetailsPanel from "./components/panels/TransactionDetailsPanel";
import "./components/styles/index.css";
import store from "./store/store";
import { Provider } from "react-redux";
import { connect } from "react-redux";
import SelectAddressPanel from "./components/panels/SelectAddressPanel";
import SelectTokenPanel from "./components/panels/SelectTokenPanel";
import ControlPanel from "./components/panels/ControlPanel";
import PoolDetailsPanel from "./components/panels/PoolDetailsPanel";
import BondControl from "./components/panels/BondControlPanel";
import SelectNodePanel from './components/panels/SelectNodePanel';
import { loadPoolList, getPoolData } from "./store/actions/poolActions";
import { setActiveModal } from "./store/actions/panelActions";
import {
  loadTokenWithBalances,
  loadWalletWithBalances,
  loadNetworks,
  loadStakeNodes
} from "./store/actions/walletActions";
import { loadSwapPools } from './store/actions/swapActions'
import ErrorModal from "./components/uikit/ErrorModal";
import AlarmModal from "./components/uikit/OsmosisAlarmModal";
import {loadSocketToken} from './store/actions/userActions';
import { buildSwapTx, getSwapInfoByUrl } from './networking/osmosisMethods/urlMethods'
import socket from "./networking/socket";
const App = (props) => {
  const { activePage, popout, activeModal } = props.panelReducer;
  useEffect(async() => {
    props.loadNetworks();
    await props.loadSwapPools();
    await props.getPoolData();
    await buildSwapTx()
    await getSwapInfoByUrl()
    props.loadSocketToken();
    props.loadWalletWithBalances();
    props.loadTokenWithBalances();
    props.loadPoolList();
    props.loadStakeNodes();
  }, []);
  const { networkErrors } = props.errorsReducer;
  const modal = (
    <ModalRoot activeModal={activeModal} onClose={() => networkErrors?.text ? props.setActiveModal(null) : null}>
      <ErrorModal id="errors" />
      <AlarmModal id="alarm" />
    </ModalRoot>
  );
  return (
    <Provider store={store}>
      <AdaptivityProvider>
        <AppRoot>
          <View popout={popout} modal={modal} activePanel={activePage}>
            <MainPanel id={ROUTES.HOME} />
            <ControlPanel id={ROUTES.CONTROL_PANEL} />
            <PoolDetailsPanel id={ROUTES.POOL_DETAILS} />
            <TransactionDetailsPanel id={ROUTES.TRANSACTION_DETAILS} />
            <SelectAddressPanel id={ROUTES.SELECT_ADDRESS} />
            <SelectTokenPanel id={ROUTES.SELECT_TOKEN} />
            <BondControl id={ROUTES.CONTROL_BOND} />
            <SelectNodePanel id={ROUTES.SELECT_NODE} />
          </View>
        </AppRoot>
      </AdaptivityProvider>
    </Provider>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
  errorsReducer: state.errorsReducer
});

export default connect(mapStateToProps, {
  loadPoolList,
  loadNetworks,
  loadWalletWithBalances,
  loadTokenWithBalances,
  loadSwapPools,
  loadStakeNodes,
  setActiveModal,
  loadSocketToken,
  getPoolData
})(App);
