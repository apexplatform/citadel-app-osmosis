import React, { useState } from 'react';
import { Content, Header, Tabbar, Search } from '@citadeldao/apps-ui-kit/dist/main';
import AddressBlock from '@citadeldao/apps-ui-kit/dist/components/uiKit/AddressBlock'
import { Config } from '../config/config';
import { useSelector, useDispatch } from 'react-redux';
import { swapActions, poolActions } from '../../store/actions';
import { useNavigate } from 'react-router-dom';
import { sortList } from '../helpers';
import { prettyNumber } from '../helpers/numberFormatter';
const SelectTokenPanel = () => {
    const config = new Config()
    const { tokens } = useSelector((state) => state.wallet)
    const { selectedTokens } = useSelector((state) => state.pool)
    const { tokenIn, tokenOut, selectedToken } = useSelector((state) => state.swap)
    const previousPanel = useSelector(state => state.panels.previousPanel)
    const { bottomInset } = useSelector(state => state.panels)
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const activeToken = selectedToken === 'INPUT' ? tokenIn : tokenOut
    const secondToken = selectedToken !== 'INPUT' ? tokenIn : tokenOut
    const [tokenList, setTokentList] = useState(sortList(tokens?.filter(elem => elem.code !== secondToken.code)))
    const back = () => navigate(previousPanel + '?' + window.location.search.slice(1))
    const searchWallet = (wallet) => {
        let arr = tokens.filter(
          (item) =>
            (item.code.substr(0, wallet.length).toLowerCase() ===
              wallet.toLowerCase() ||
            item.name.substr(0, wallet.length).toLowerCase() ===
              wallet.toLowerCase()) && item.code !== secondToken.code
        );
        setTokentList(sortList(arr));
        if (wallet.length < 1) setTokentList(sortList(tokens?.filter(elem => elem.code !== secondToken.code)));
      };
     
    const setToken = (token) => {
      if(selectedToken === 'INPUT'){
        dispatch(swapActions.setTokenIn(token))
      } else if(selectedToken === 'OUTPUT'){
        dispatch(swapActions.setTokenOut(token))
      } else {
        let temp = selectedTokens.map(elem => {
          if(elem.code === selectedToken){
            elem.token = token
            elem.code = token.code
            elem.name = token.name
            elem.logoURI = token.logoURI
          }
          return elem
        })
        poolActions.setSelectedTokens(temp);
      }
      back();
    }
    return (
        <div className='panel'>
            <Content>
                <Header border title="Select token" style={{margin: '8px 0 16px 0'}} onClick={() => back()} back={true}/>
                <Search style={{marginBottom: '10px'}} onChange={searchWallet} placeholder='Start typing..'/>
                {tokenList?.map((elem,i) =>(
                  <AddressBlock logoURI={elem.logoURI} onClick={() => setToken(elem)} active={activeToken?.code === elem?.code} style={{marginBottom: '10px'}} data={{...elem, balance: prettyNumber(elem?.balance)}} key={i}/>  
                ))}
            </Content>
            <Tabbar config={config}  bottomInset={bottomInset}/>
        </div>
    )
}

export default SelectTokenPanel