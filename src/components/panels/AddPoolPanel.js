import React, { useEffect, useState } from 'react';
import { Content, Tabbar, FeeInput } from '@citadeldao/apps-ui-kit/dist/main';
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
                <div className='base-input'>
                    <FeeInput readOnly={true} data={{network: 'OSMO'}} inputTitle='Pool Creation fee' description='Transferred to the Osmosis community pool' value={100}/>
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