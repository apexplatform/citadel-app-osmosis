import React, { useState } from 'react';
import { Content, Header, Icon, AmountInput, Button, InfoCardBlock, InfoCardItem } from '@citadeldao/apps-ui-kit/dist/main';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { poolActions } from '../../store/actions';
import { estimateExitPool } from "../../networking/osmosisMethods/poolMethods";
import { amountFormatter, prettyNumber } from '../helpers/numberFormatter';
import ROUTES from '../../routes';

const RemoveLiquidityPanel = () => {
    const { pool } = useSelector(state => state.pool)
    const [amount, setAmount] = useState(0)
    const previousPanel = useSelector(state => state.panels.previousPanel)
    const navigate = useNavigate()
    const back = () => navigate(previousPanel)
    let inputTitle = "Pool #" + pool.id + " ";
    pool.poolInfo?.forEach((item, i) => {
        if (i === pool.poolInfo.length - 1) {
            inputTitle += item.symbol;
        } else {
            inputTitle += item.symbol + "/";
        }
    });
    const data = {
        network: 'GAMM/' + pool?.id,
        myLiquidity: prettyNumber(pool?.gammShare?.maxDecimals(6).toString())
    }
    const [error, setError] = useState(false);
    const [poolAmounts, setPoolAmounts] = useState([]);
    const updateAmount = (val) => {
        val = amountFormatter(val)
        setAmount(val)
        if (val.length) {
          if (+pool.gammShare?.toString() > 0) {
            let amount = val; // pool.gammShare.toString() : 
            setAmount(amount);
            const amounts = estimateExitPool(amount, pool) || poolAmounts;
            const balance = pool.gammShare.maxDecimals(6).toString();
            setError(+balance < +val);
            setPoolAmounts(amounts);
          } else {
            setError(true);
          }
        } else {
          setError(true);
        }
      };
      const prepareExitPool = () => {
        if (!error) {
          poolActions.prepareExitPoolTransaction(poolAmounts, amount);
        }
        navigate(ROUTES.POOL_DETAILS)
      };
    return (
        <div className='panel'>
            <Content>
                <Header border title="Remove liquidity" style={{margin: '8px 0 16px 0'}} onClick={() => back()} back={true}/>
                <AmountInput  
                    inputTitle={inputTitle} 
                    action={true} 
                    data={data} 
                    style={{marginBottom: '16px'}}
                    actionTxt='MAX' 
                    value={amount} 
                    checkAmount={updateAmount}
                    onMaxClick={() => updateAmount(data.myLiquidity)}
                />
                <InfoCardBlock>
                    <h2 className='info-card-header-h2'>You will receive</h2>
                    {pool.poolAssets.map((token, i) => (
                        <InfoCardItem key={i} text={pool.poolInfo[i].symbol}>
                            <p className='amount-p'>{poolAmounts[i]?.maxDecimals(4).toString() || '0'} 
                            <span> {pool.poolInfo[i].symbol}</span></p>
                        </InfoCardItem>
                    ))}
                </InfoCardBlock>

                {error && 
                <div className='row' id='amount-error'>
                    <div className='amount-error__circle'>
                        <Icon name='alarm-octagon' color='#EA2929' width='16px'/>
                    </div>
                    <p>Insufficient amount</p>
                </div>}
                <div className='center'>
                    <Button disabled={error} onClick={() => prepareExitPool()} hoverBgColor='#5639E0' style={{marginTop: '16px'}} textColor='#FFFFFF' bgColor='#7C63F5'>Remove</Button>
                </div>
            </Content>
        </div>
    )
}

export default RemoveLiquidityPanel