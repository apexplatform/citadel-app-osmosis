import React, { useEffect, useState } from 'react';
import { Content, Tabbar } from '@citadeldao/apps-ui-kit/dist/main';
import { Config } from '../config/config';
import StepsBlock from '../uikit/StepsBlock';
import { useLocation } from 'react-router-dom';
import FirstStepContainer from '../containers/FirstStepContainer';
import SecondStepContainer from '../containers/SecondStepContainer';
import ThirdStepContainer from '../containers/ThirdStepContainer';
import { panelActions } from '../../store/actions';
import { useSelector } from 'react-redux';
import '../styles/panels/pool.css'

const AddPoolPanel = () => {
    const config = new Config()
    const [activeOption, setActiveOption] = useState(1);
    const location = useLocation()
    const { bottomInset } = useSelector(state => state.panels)
    useEffect(() => {
        panelActions.setPreviousPanel(location.pathname)
        // eslint-disable-next-line
    },[])
    return (
        <div className='panel'>
            <Content>
                <StepsBlock  activeOption={activeOption} setActiveOption={setActiveOption} />
                <div className='input osmo-pool-fee'>
                    <div>
                        <h3>Pool Creation fee</h3>
                        <p>Transferred to the Osmosis community pool</p>
                    </div>
                    <div className='row'>
                        <h4>100</h4>
                        <span>OSMO</span>
                    </div>
                </div>
                {activeOption === 1 && (
                    <FirstStepContainer setActiveOption={setActiveOption} />
                )}
                {activeOption === 2 && (
                    <SecondStepContainer setActiveOption={setActiveOption} />
                )}
                {activeOption === 3 && <ThirdStepContainer />}
            </Content>
            <Tabbar config={config} bottomInset={bottomInset}/>
        </div>
    )
}

export default AddPoolPanel