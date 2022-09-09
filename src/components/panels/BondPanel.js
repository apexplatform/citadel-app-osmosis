import React, { useState, useEffect } from 'react';
import { Content, Header, Icon, ValidatorCard, NoValidatorCard, SelectedCard, Button, CoinIcon, SelectToken, NotificationCard} from '@citadeldao/apps-ui-kit/dist/main';
import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { poolActions, panelActions } from '../../store/actions';
import { amountFormatter, prettyNumber } from '../helpers/numberFormatter';
import ROUTES  from '../../routes';

const BondPanel = () => {
    const { pool, selectedValidator, isSuperfluidLock, amount } = useSelector(state => state.pool)
    const navigate = useNavigate()
    const location = useLocation()
    const back = () => navigate(ROUTES.MANAGE_BOND)
    const [activeOption, setActiveOption] = useState(pool.lockDurations[pool.lockDurations.length-1]);
    const radioChangeHandler = (id) => {
        setActiveOption(id)
    }
    useEffect(() => {  
        panelActions.setPreviousPanel(location.pathname)
        // eslint-disable-next-line
    },[])
    const [error, setError] = useState(false);
    const [shareInAmount, setAmount] = useState(amount);
    const updateAmount = (val, isMax = false) => {
        val = amountFormatter(val)
        setAmount(val)
        poolActions.setAmount(val)
        if (+pool.gammShare?.toString() > 0) {
          let amount = isMax ? pool.gammShare?.toString() : val;
          setAmount(amount);
          poolActions.setAmount(amount)
          const balance = pool.gammShare?.maxDecimals(6).toString();
          setError(+balance < +val);
        } else {
          setError(true);
        }
    };
    const prepareLockTokens = () => {
      if (!error) {
        if(pool.isSuperfluidPool && selectedValidator && activeOption.duration === 14){
            poolActions.prepareLockAndDelegateTransaction(shareInAmount, selectedValidator);
        }else{
            poolActions.prepareLockTokensTransaction(shareInAmount, activeOption);
        }
        navigate(ROUTES.POOL_DETAILS)
      }
    };
    const data = {
        network: 'osmosis',
        balance: prettyNumber(pool.gammShare?.toString()),
        code: 'GAMM/' + pool.id
    }
    return (
        <div className='panel'>
            <Content>
                <Header border title="Bond LP tokens" style={{margin: '8px 0 16px 0'}} onClick={() => back()} back={true}/>
                <div className='row'>
                {pool.lockDurations?.map((item) => (
                    <SelectedCard 
                        key={item?.duration}
                        label={item.duration === 1 ? (
                            <p>A day</p>
                          ) : (
                            <p>{item.duration} days</p>
                          )}
                        amount={item.apr} 
                        amountColor="#3A5EE6" 
                        bgColor={(pool.isSuperfluidPool && item.duration === 14) ? "#E4F3F5" : "#F4F6FF" }
                        id={item?.duration}  
                        changed={() => radioChangeHandler(item)} 
                        value={item?.duration}
                        name={pool.isSuperfluidPool && item.duration === 14 ? <CoinIcon name='osmosis' color='#5639E0' size='small'/> : null}
                        isSelected={activeOption.duration === item?.duration}
                        selectedColor="#F1EEFF"
                        borderColor="#7C63F5"
                     />
                    ))}
                </div>
                <SelectToken 
                    max={true}   
                    token={true} 
                    balance={true}  
                    title='Amount to bond'
                    style={{margin: '16px 0'}} 
                    value={shareInAmount} 
                    checkAmount={updateAmount} 
                    onMaxClick={() => updateAmount(shareInAmount, true)}
                    selectedOption={data} 
                    field='from'
                />
                {!selectedValidator?.address && pool.isSuperfluidPool && !isSuperfluidLock && activeOption?.duration === 14 && 
                    <NoValidatorCard 
                        style={{margin: '16px 0'}} 
                        text="My Superfluid Validator" 
                        label="no validator"
                        onClick={() => navigate(ROUTES.SELECT_VALIDATOR)}
                    /> }
                {pool.isSuperfluidPool && selectedValidator && activeOption?.duration === 14 &&
                    <ValidatorCard 
                        validatorData={selectedValidator} 
                        style={{margin: '16px 0'}} 
                        text="My Superfluid Validator" 
                        showArrow
                        onClick={() => navigate(ROUTES.SELECT_VALIDATOR)}
                    /> 
                }
                <NotificationCard 
                    text='Due to high network congestion, we are temporarily limiting users to 2 bonding transactions per day' 
                    iconColor='#6B93C0' 
                    textColor='#59779A' 
                    bgColor='#E5EDF5'
                    hideIcon
                />
                {error && <div className='row' id='amount-error'>
                    <Icon name='alarm-octagon' color='#EA2929' width='16px'/>
                    <p>Insufficient amount</p>
                </div>}
                 <div className='center'>
                    <Button disabled={error || shareInAmount <= 0} onClick={() => prepareLockTokens()} hoverBgColor='#5639E0' style={{marginTop: '16px'}} textColor='#FFFFFF' bgColor='#7C63F5'>Bond</Button>
                </div>
            </Content>
        </div>
    )
}

export default BondPanel