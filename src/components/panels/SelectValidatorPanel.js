import React, { useState } from 'react';
import { Content, Header, Tabbar, Search, NodeValidatorCard } from '@citadeldao/apps-ui-kit/dist/main';
import { Config } from '../config/config';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { poolActions } from '../../store/actions';
import ROUTES from '../../routes';
const SelectValidatorPanel = () => {
    const config = new Config()
    const { pool } = useSelector(state => state.pool)
    const previousPanel = useSelector(state => state.panels.previousPanel)
    const { bottomInset } = useSelector(state => state.panels)
    const { stakeNodes } = useSelector(state => state.wallet)
    const navigate = useNavigate()
    const back = () => navigate(previousPanel)
    const [list, setList] = useState(stakeNodes);

    const searchNode = (val) => {
      if(val.length){
        setList(stakeNodes.filter((node) => node.name.toLowerCase().includes(val.toLowerCase())))
      }else{
        setList(stakeNodes.slice(0,10))
      }
    }
    const setValidator = (node) => {
      poolActions.setSelectedNode(node)
      if(previousPanel === ROUTES.POOL_DETAILS){
        poolActions.prepareSuperfluidDelegate(node,pool.lockDurations.find(item => item.duration === 14))
      }
      back();
    }
    return (
        <div className='panel'>
            <Content>
                <Header border title="Select validator" style={{margin: '8px 0 16px 0'}} onClick={() => back()} back={true}/>
                <Input type='search' style={{marginBottom: '10px'}} onChange={searchNode} placeholder='Start typing..'/>
                {list?.map((validator,i) =>(
                   <NodeValidatorCard
                    key={i}
                    network='osmosis'
                    name={validator.name}
                    address={validator.address}
                    logo={validator.imageSource}
                    fee={validator.fee}
                    status={false}
                    onClick={() => setValidator(validator)}
                    type='validator'
                  />
                ))}
            </Content>
            <Tabbar config={config}  bottomInset={bottomInset}/>
        </div>
    )
}

export default SelectValidatorPanel