import React from 'react'
import { Accordion } from '@citadeldao/apps-ui-kit/dist/main'
import text from '../../text.json'
import '../styles/uiKit/guides.css'
import { ReactComponent as Guide1 } from '../guides/guide1.svg'
import { ReactComponent as Guide2 } from '../guides/guide2.svg'
import { ReactComponent as Guide3 } from '../guides/guide3.svg'
import { ReactComponent as Guide4 } from '../guides/guide4.svg'
import { ReactComponent as Guide5 } from '../guides/guide5.svg'
import { ReactComponent as Guide6 } from '../guides/guide5.svg'

const GuidesPanel = () => {
    return (
        <div className='guides-panel'>
            <div>
                <h3 className='heading-text-h3'>Guides & Questions</h3>
                <p className='description-text'>Learn more about Osmosis</p>
            </div>
            <Accordion title='IBC Deposit/Withdrawal' type="guide">
                <h4>{text.GUIDES_HEADER_1}</h4>
                <p>{text.GUIDES_DESCRIPTION_1}</p>
                <Guide1 className='quide-img'/>
                <h4>{text.GUIDES_HEADER_2}</h4>
                <p>{text.GUIDES_DESCRIPTION_2}</p>
                <Guide2 className='quide-img'/>
                <h4>{text.GUIDES_HEADER_3}</h4>
                <p>{text.GUIDES_DESCRIPTION_3}</p>
                <Guide3 className='quide-img'/>
                <h4>{text.GUIDES_HEADER_4}</h4>
                <p>{text.GUIDES_DESCRIPTION_4}</p>
                <Guide4 className='quide-img'/>
                <h4>{text.GUIDES_HEADER_5}</h4>
                <p>{text.GUIDES_DESCRIPTION_5}</p>
                <Guide5 className='quide-img'/>
                <h4>{text.GUIDES_HEADER_6}</h4>
                <p>{text.GUIDES_DESCRIPTION_6}</p>
                <Guide6 className='quide-img'/>
            </Accordion>
        </div>
    )
}

export default GuidesPanel