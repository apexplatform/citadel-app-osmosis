import React, { useState } from 'react';
import { Content, Header, Button, BalanceInfoCard, BalanceInfoCardItem } from '@citadeldao/apps-ui-kit/dist/main';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { poolActions } from '../../store/actions';
import ROUTES  from '../../routes';
import { prettyNumber } from '../helpers/numberFormatter';

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
                            <BalanceInfoCardItem title='Unbonding duration' amountColor='#292929' textColor='#59779A'>{item.duration === 1 ? 'a day' : item.duration + ' days'}</BalanceInfoCardItem>
                            <BalanceInfoCardItem className='center-text' title='Current ARY' textColor='#59779A' amountColor='#D900AB' symbol='%'>{item.apr}</BalanceInfoCardItem>
                            <BalanceInfoCardItem className='right-text' title='Amount' textColor='#59779A' amountColor='#5639E0' symbol={'GAMM/' + pool.id}>{prettyNumber(item.lockup.amount.trim(true).toString() || 0)}</BalanceInfoCardItem>
                        </BalanceInfoCard>
                    </div>
                    
                ))}
                <div className='center'>
                    <Button disabled={error} hoverBgColor='#5639E0' onClick={() => prepareUnbondTokens()} style={{marginTop: '16px'}} textColor='#FFFFFF' bgColor='#7C63F5'>Unbond</Button>
                </div>
            </Content>
        </div>
    )
}

export default UnbondPanel