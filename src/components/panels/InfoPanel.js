import React, {useState,useRef} from 'react'
// eslint-disable-next-line
import { Tablist, Header, Content, Tab} from '@citadeldao/apps-ui-kit/dist/main'
import GuidesPanel from './GuidesPanel'
import Assets from './AssetsPanel'
const InfoPanel = (props) => {
    // eslint-disable-next-line
    const [active, setActive] = useState('tab1')
    const headerRef = useRef()
    return (
        <section className='info-panel'>
            <div className='panel-header-line' style={{background: props.config.headerParamsFromConfig('TOP_BACKGROUND_COLOR') }}></div>
            <Header refs={headerRef}/>
            <Content>
                <Tablist active={active} setActive={setActive} type="button">
                    <Tab id='tab1' label='Assets'><Assets/></Tab>
                    <Tab id='tab2' label='Guides'><GuidesPanel/></Tab>
                </Tablist> 
            </Content> 
        </section>
    )
}

export default InfoPanel