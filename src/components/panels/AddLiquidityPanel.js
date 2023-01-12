import React, { useState } from 'react';
import { Content, Header, FormGroupBalance, InputSelect, Icon, Input, Checkbox, Button } from '@citadeldao/apps-ui-kit/dist/main';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { poolActions } from '../../store/actions';
import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { amountFormatter } from '../helpers/numberFormatter';
import ROUTES from '../../routes';

const AddLiquidityPanel = () => {
    const { pool, tokenBalances} = useSelector(state => state.pool)
    const { tokens } = useSelector(state => state.wallet)
    const previousPanel = useSelector(state => state.panels.previousPanel)
    const navigate = useNavigate()
    const back = () => navigate(previousPanel || '/')
    const [error, setError] = useState(false);
    const [errorZero, setErrorZero] = useState(true);
    let initialAmounts = [];
    pool.pool_assets.forEach((item, index) => {
        let code = pool.poolCoinInfo[index].symbol
        initialAmounts.push({
            index: index,
            amount: 0,
            denom: item.token.denom,
            decimals: pool.poolCoinInfo[index].coinDecimals,
            code,
            net: code,
            network: code,
            balance: tokens.find(elem => elem.code === pool.poolCoinInfo[index].coinDenom)?.balance || 0,
            logoURI: tokens.find(elem => elem.code === pool.poolCoinInfo[index].coinDenom)?.logoURI 
        });
    });
    
    const prettyBalanceList = [];
    tokenBalances?.forEach((item) => {
        pool.pool_assets?.forEach((pool) => {
            if (item.denom === pool.token.denom) {
                prettyBalanceList.push(item);
            }
        });
    });
    const [shareOutAmount, setShareOutAmount] = useState(null);
    const [amounts, setAmount] = useState(initialAmounts);
    const [index, setIndex] = useState(0);
    const [token,setToken] = useState(amounts[index])
    const [amount, setSLPAmount] = useState(token.amount);
    const [singleLp, setSingleLp] = useState(false);

    const tokenOptions = [];
    pool.poolCoinInfo.forEach((item, index) => {
        tokenOptions.push({
          label: item.coinDenom || pool.poolInfo[index]?.symbol,
          value: index,
          logo: item.coinImageUrl,
        });
      });
    const updateAmount = (amount, index , isMax = false) => {
        amount = amountFormatter(amount)
        let temp = amounts;
        temp[index].amount = amount;
        setError(false);
        setErrorZero(false);
        if (amount.length) {
            if (singleLp) {
                setSLPAmount(amount)
                setAmount(temp);
                checkErrors(temp[index])
            } else {
                const tokenInAmount = new IntPretty(new Dec(amount));
                const totalShare = new IntPretty(
                    pool.total_shares.amount
                ).moveDecimalPointLeft(18);
                const currentPoolDenom = amounts[index].denom;
                const currentAsset = pool.pool_assets.find(
                    (asset) => asset.token.denom === currentPoolDenom
                );
                if (!currentAsset) {
                    return;
                }
                const currentAssetAmount = new IntPretty(currentAsset.token.amount).moveDecimalPointLeft(pool.poolCoinInfo[index].coinDecimals);
                const shareOutAmount = tokenInAmount.mul(totalShare).quo(currentAssetAmount);
                setShareOutAmount(shareOutAmount);
                const otherConfigs = amounts.slice();
                otherConfigs.splice(index, 1);
                const otherCoinInfo = pool.poolCoinInfo.slice();
                otherCoinInfo.splice(index, 1);

            for (const otherConfig of otherConfigs) {
                const otherPoolAsset = pool.pool_assets.find(
                    (asset) => asset.token.denom === otherConfig.denom
                );
                if (!otherPoolAsset) {
                    return;
                }
                const otherAssetAmount = new IntPretty(new Dec(otherPoolAsset.token.amount)).moveDecimalPointLeft(otherCoinInfo[0].coinDecimals);
                temp.forEach((item, i) => {
                if (item.denom === otherConfig.denom) {
                    temp[i].amount = shareOutAmount
                    .mul(otherAssetAmount)
                    .quo(totalShare)
                    .trim(true)
                    .shrink(true)
                    .maxDecimals(isMax ? 6 : 4)
                    .locale(false)
                    .toString();
                    tokens.forEach((token) => {
                    if (otherConfig.denom === token.denom) {
                        if (+temp[i].amount > +token.balance) {
                            setError('Insufficient amount');
                        }else{
                            setError(false)
                        }
                    }
                    });
                }
                });
            }
            let balanceAmount = 0;
            tokenBalances?.forEach((item) => {
                if (item.denom === amounts[index].denom) {
                    balanceAmount = item.amount;
                }
            });
            let balance = new CoinPretty({ coinDecimals: 6 }, new Dec(balanceAmount));
            balance._options.hideDenom = true;
            balance = balance.toString();
            if (prettyBalanceList.length < pool.pool_assets.length || +balance < +amount) {
                setError('Insufficient amount');
            }else{
                setError(false)
            }
            setAmount(temp);
            }
            setToken(amounts[index])
        }
        if (+amount === 0 && isMax) {
            setError('Amount is zero');
        }
    };
    
    const checkErrors = (elem) => {
        if(+elem.amount > +elem.balance){
            setError('Insufficient amount');
        } else {
            setError(false)
        }
    }

    const prepareJoinPool = () => {
        if (!error && !errorZero) {
            if (singleLp) {
                poolActions.prepareJoinPoolTransaction(amounts[index], shareOutAmount, singleLp);
            } else {
                poolActions.prepareJoinPoolTransaction(amounts, shareOutAmount, singleLp);
            }
            navigate(ROUTES.POOL_DETAILS)
        }
    };
    
    const selectToken = (code) => {
        let token = amounts.find(elem => elem.code === code)
        setIndex(token.index)
        setToken(token)
        checkErrors(token)
    }
    return (
        <div className='panel'>
            <Content>
                <Header border title="Add liquidity" style={{margin: '8px 0 16px 0'}} onClick={() => back()} back={true}/>
                {!singleLp &&
                amounts.map((token, index) => (
                    <div key={index}>
                    <Input  
                        type='amount'
                        label={token.network + ' amount'}
                        style={{marginBottom: '14px'}}
                        value={token.amount}
                        currency={token.network}
                        onChange={updateAmount}
                        action={{onClick:() => updateAmount(token.balance, index, true),text: 'MAX'}}
                    /> 
                    <FormGroupBalance  
                        balance={token?.balance || '0'} 
                        text="Balance" 
                        currency={token?.network}
                        placement="end"
                    /></div>
                ))}
                { singleLp &&
                    <><InputSelect
                        input={{
                            value: amount,
                            label: 'Amount',
                            onChange: (value) => updateAmount(value, index),
                            action: { text: 'MAX', onClick: () => updateAmount(token.balance, index, true) }
                        }}
                        select={{
                            value: amounts[0]?.network,
                            options: amounts.map(elem => ({...elem,icon: elem.logoURI, label: elem.network, value: elem.network})),
                            label: 'Token',
                            onChange: selectToken,
                        }}
                        currencyKey = 'network'
                    />   
                    <FormGroupBalance  
                        placement="end"
                        balance={token.balance+''} 
                        text="Balance" 
                        currency={token?.network}
                    /></>
                }
                <Checkbox textColor='#3C5B7E' value={singleLp} onChange={() =>  {updateAmount(amount,0);setSingleLp(!singleLp)}}>Single Asset LP</Checkbox>
                {error && 
                <div className='row' id='amount-error'>
                    <div className='amount-error__circle'>
                        <Icon name='alarm-octagon' color='#EA2929' width='16px'/>
                    </div>
                    <p>{error}</p>
                </div>}
                <div className='center'>
                    <Button disabled={error} hoverBgColor='#5639E0' onClick={() => prepareJoinPool()} style={{marginTop: '16px'}} textColor='#FFFFFF' bgColor='#7C63F5'>Add</Button>
                </div>
            </Content>
        </div>
    )
}

export default AddLiquidityPanel