import React, { useState } from 'react';
import { Content, Header, BigButtons, BalanceInfoCard, BalanceInfoCardItem } from '@citadeldao/apps-ui-kit/dist/main';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { poolActions } from '../../store/actions';
import ROUTES  from '../../routes';

const UnbondPanel = () => {
    const { pool, isSuperfluidLock } = useSelector(state => state.pool)
    const previousPanel = useSelector(state => state.panels.previousPanel)
    const navigate = useNavigate()
    const back = () => navigate(previousPanel)
    const [option, setOption] = useState(null);
    const [error, setError] = useState(true);

    const prepareUnbondTokens = () => {
        if (!error) {
            let isSyntheticLock = isSuperfluidLock && option.duration === 14
            poolActions.prepareBeginUnlockTokensTransaction(option,isSyntheticLock);
            navigate(ROUTES.POOL_DETAILS)
        }
    };
    const checkOption = (option) => {
        if (+option.lockup.amount
            .maxDecimals(6)
            .trim(true)
            .toString()
            .replace(",", "") > 0
        ) {
            setOption(option);
            setError(false);
        } else {
            setOption(option);
            setError(true);
        }
    };
    return (
        <div className='panel'>
            <Content>
                <Header border title="Unbond LP tokens" style={{margin: '8px 0 16px 0'}} onClick={() => back()} back={true}/>
                <p className='unbond-description-p'>Osmosis provides a bonding period where you would be able to get APRs based on the duration of bonding period. The longer you decide to bond your LP tokens, the higher returns you will receive. 
                <br/><b>Tap to choose the suitable option.</b></p>
                {pool.lockDurations.map((item) => (
                    <div key={item.duration} onClick={() => checkOption(item)}>
                        <BalanceInfoCard style={{marginBottom: '16px'}} className={option?.duration === item?.duration ? 'active-card' : ''}>
                            <BalanceInfoCardItem title='Unbonding duration' amountColor='#292929' textColor='#59779A' balance= {item.duration === 1 ? 'a day' : item.duration + ' days'} />
                            <BalanceInfoCardItem className='center-text' title='Current ARY' textColor='#59779A' balance={item.apr} amountColor='#D900AB' symbol='%'/>
                            <BalanceInfoCardItem className='right-text' title='Amount' textColor='#59779A' balance= {item.lockup.amount.maxDecimals(2).trim(true).toString() || 0} amountColor='#5639E0' symbol={'GAMM/' + pool.id}/>
                        </BalanceInfoCard>
                    </div>
                    
                ))}
                <div className='center'>
                    <BigButtons disabled={error} onClick={() => prepareUnbondTokens()} style={{marginTop: '16px'}} text='Unbond' textColor='#FFFFFF' bgColor='#7C63F5'  hideIcon={true}/>
                </div>
            </Content>
        </div>
    )
}

export default UnbondPanel