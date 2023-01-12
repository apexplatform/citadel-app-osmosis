import React, { useState, useEffect } from 'react';
import './components/styles/panels/index.css';
import GuidesPanel from './components/panels/GuidesPanel';
import ROUTES from './routes';
import SelectTokenPanel from './components/panels/SelectTokenPanel';
import SwapPanel from './components/panels/SwapPanel';
import AddPool from './components/panels/AddPoolPanel';
import TransactionsPanel from './components/panels/TransactionsPanel';
import TransactionsDetailsPanel from './components/panels/TransactionDetails';
import SelectValidatorPanel from './components/panels/SelectValidatorPanel';
import { useLocation } from 'react-router-dom';
import PoolDetailsPanel from './components/panels/PoolDetailsPanel'
import { useDispatch, useSelector } from 'react-redux';
import PoolsPanel from './components/panels/PoolsPanel'
import { errorActions, poolActions } from './store/actions';
import text from './text.json';
import { useNavigate } from 'react-router-dom';
import {
    StatusPopup,
    PopupWindow,
    TipCard,
    NotificationCard,
    Panel,
    Modal,
    View,
    AddressSectionCard,
} from '@citadeldao/apps-ui-kit/dist/main';
import InfoPanel from './components/panels/InfoPanel';
import { Config } from './components/config/config';
import SelectAddressPanel from './components/panels/SelectAddressPanel';
import { prettyNumber } from './components/helpers/numberFormatter';
import RemoveLiquidityPanel from './components/panels/RemoveLiquidityPanel';
import AddLiquidityPanel from './components/panels/AddLiquidityPanel';
import BondPanel from './components/panels/BondPanel';
import UnbondPanel from './components/panels/UnbondPanel';
import ManageBondPanel from './components/panels/ManageBond';
const MainView = () => {
    const location = useLocation();
    const dispatch = useDispatch();
    const showModal = useSelector(state => state.errors.openErrorModal);
    const { validationErrors, errors } = useSelector(state => state.errors);
    const { borderRadius } = useSelector(state => state.panels)
    const { activeWallet } = useSelector(state => state.wallet);
    const [showSuccess, setShowSuccess] = useState(errors);

    useEffect(() => {
        setShowSuccess(errors);
        // eslint-disable-next-line 
    }, [errors]);

    useEffect(() => {
        dispatch(poolActions.loadPoolList())
        // eslint-disable-next-line 
    }, [activeWallet]);

    const clearErrors = () => {
        setShowSuccess(false);
        dispatch(errorActions.clearErrors());
    };
    const navigate = useNavigate();
    let wallet = activeWallet;

    if (activeWallet) {
      wallet = {...activeWallet,balance: prettyNumber(activeWallet?.balance?.mainBalance)}
    }
    const config = new Config()
    return(
        <View>
            <Panel config={config} style={{borderRadius: `${borderRadius}px`}}>
                <AddressSectionCard onClick={() => navigate(ROUTES.SELECT_ADDRESS)}
                                    className='select-address-card' data={wallet}
                                    id="/show"></AddressSectionCard>
                <PopupWindow show={showSuccess} id="/show">
                    <StatusPopup text={errors?.text} type="error" showPopup={clearErrors}/>
                </PopupWindow>
                <SwapPanel id={ROUTES.SWAP} />
                <PoolsPanel id={ROUTES.POOLS}/>
                <AddPool id={ROUTES.ADD_POOL}/>
                <AddLiquidityPanel id={ROUTES.ADD_LIQUIDITY} />
                <RemoveLiquidityPanel id={ROUTES.REMOVE_LIQUIDITY}/>
                <BondPanel id={ROUTES.BOND} />
                <UnbondPanel id={ROUTES.UNBOND} />
                <ManageBondPanel id={ROUTES.MANAGE_BOND} />
                <PoolDetailsPanel id={ROUTES.POOL_DETAILS} />
                <TransactionsPanel id={ROUTES.TRANSACTIONS}/>
                <GuidesPanel id={ROUTES.INFO_MENU_GUIDE}/>
                <SelectValidatorPanel id={ROUTES.SELECT_VALIDATOR} />
                <SelectTokenPanel id={ROUTES.SELECT_TOKEN} />
                <SelectAddressPanel id={ROUTES.SELECT_ADDRESS}/>
                <TransactionsDetailsPanel id={ROUTES.TRANSACTION_DETAILS}/>
                <Modal canClose={false} borderRadius={borderRadius}  id={ROUTES.SWAP} show={showModal && !location.pathname.includes('/info')}>
                {validationErrors?.text && <div>
                    <NotificationCard text={text.ADDRESS_ERROR_HEADER} iconColor="#00B2FE"
                                      boldText/>
                    <p className="description-text">{text.ADDRESS_ERROR_DESCRIPTION}</p>
                    <TipCard text={text.ADDRESS_ERROR_TIP}/>
                </div>}
            </Modal>
            </Panel>
            <InfoPanel config={config}/> 
        </View>
    );
};

export default MainView;