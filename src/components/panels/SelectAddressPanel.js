import React, { useState } from 'react';
import { Content, Header, Tabbar, Search } from '@citadeldao/apps-ui-kit/dist/main';
import AddressBlock from '@citadeldao/apps-ui-kit/dist/components/uiKit/AddressBlock'
import { Config } from '../config/config';
import { useSelector, useDispatch } from 'react-redux';
import { walletActions, poolActions } from '../../store/actions';
import { useNavigate } from 'react-router-dom';
import { prettyNumber } from '../helpers/numberFormatter';
import ROUTES from '../../routes';
const SelectAddressPanel = () => {
    const config = new Config()
    const { wallets, activeWallet, usdPrice } = useSelector((state) => state.wallet)
    const [walletList, setWalletList] = useState(wallets)
    const { bottomInset } = useSelector(state => state.panels)
    const previousPanel = useSelector(state => state.panels.previousPanel)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const back = () => navigate((previousPanel === ROUTES.MANAGE_BOND || previousPanel === ROUTES.BOND) ? ROUTES.POOL_DETAILS : previousPanel)
    const searchWallet = (wallet) => {
        let arr = wallets.filter(
          (item) =>
            item.code.substr(0, wallet.length).toLowerCase() ===
              wallet.toLowerCase() ||
            item.name.substr(0, wallet.length).toLowerCase() ===
              wallet.toLowerCase() ||
            item.address.substr(0, wallet.length).toLowerCase() ===
              wallet.toLowerCase()
        );
        setWalletList(arr);
        if (wallet.length < 1) setWalletList(wallets);
      };
    const setActiveWallet = (wallet) => {
      if(wallet.address !== activeWallet.address){
        dispatch(walletActions.setActiveWallet(wallet))
        poolActions.getPoolData()
      }
      back();
    }
    return (
        <div className='panel'>
            <Content>
                <Header border title="Select an address" style={{margin: '8px 0 16px 0'}} onClick={() => back()} back={true}/>
                <Search style={{marginBottom: '10px'}} onChange={searchWallet} placeholder='Start typing..'/>
                {walletList?.map((elem,i) =>(
                  <AddressBlock onClick={() => setActiveWallet(elem)} active={activeWallet?.address === elem?.address} style={{marginBottom: '10px'}} data={{...elem, balance: prettyNumber(elem?.balance?.mainBalance)}} key={i} usdPrice={usdPrice > 0 ? prettyNumber(elem.balance?.mainBalance * usdPrice,2) : ''}/>  
                ))}
            </Content>
            <Tabbar config={config}  bottomInset={bottomInset}/>
        </div>
    )
}

export default SelectAddressPanel