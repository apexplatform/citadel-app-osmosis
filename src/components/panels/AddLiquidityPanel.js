import React, { useState } from 'react';
import { Content, Header, SelectInput, Icon, AmountInput, Checkbox, Button } from '@citadeldao/apps-ui-kit/dist/main';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { poolActions } from '../../store/actions';
import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { amountFormatter, prettyNumber } from '../helpers/numberFormatter';
import ROUTES from '../../routes';

const AddLiquidityPanel = () => {
    const { pool, tokenBalances} = useSelector(state => state.pool)
    const { tokens } = useSelector(state => state.wallet)
    const previousPanel = useSelector(state => state.panels.previousPanel)
    const navigate = useNavigate()
    const back = () => navigate(previousPanel || '/')
    const [error, setError] = useState(false);
    const [errorZero, setErrorZero] = useState(true);
    const [usdPrice, setUsdPrice] = useState('0');
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
            logoImg: <img src={tokens.find(elem => elem.code === pool.poolCoinInfo[index].coinDenom)?.logoURI || 'img/tokens/unsupported.svg'} alt='icon' />
        });
    });
    
    const prettyBalanceList = [];
    tokenBalances.forEach((item) => {
        pool.pool_assets.forEach((pool) => {
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
    const updateAmount = (amount, symbol, index ,isMax = false) => {
        amount = amountFormatter(amount)
        let price = 0;
        let poolInfo = pool.poolInfo;
        if (poolInfo) {
            price = (poolInfo[index === 0 ? 1 : 0].price * poolInfo[index === 0 ? 1 : 0]?.amount) / poolInfo[index]?.amount;
        }
        let temp = amounts;
        temp[index].amount = amount;
        setError(false);
        setErrorZero(false);
        if (amount.length) {
            if (singleLp) {
                setSLPAmount(amount)
                setAmount(temp);
                setUsdPrice(price * +temp[index]?.amount);
                checkErrors(temp[index])
            } else {
                setUsdPrice(price * +amount);
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
            tokenBalances.forEach((item) => {
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
    
    const selectToken = (token) => {
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
                    <AmountInput 
                        index={token.index} 
                        style={{marginBottom : '14px'}} 
                        key={index} 
                        inputTitle={token.network + ' amount'} 
                        balance={true}  
                        action={true} 
                        data={token} 
                        actionTxt='MAX' 
                        value={token.amount} 
                        checkAmount={updateAmount}
                        onMaxClick={() => updateAmount(token.balance, token.network, index, true)}
                    />
                ))}
                { singleLp &&
                    <SelectInput 
                        max={true}   
                        token={true} 
                        balance={true}  
                        data={amounts} 
                        usdPrice={true}
                        index={index}
                        logoImg={token.logoImg}
                        style={{marginBottom : '14px'}} 
                        value={amount} 
                        setValue={(value) => updateAmount(value, token.network, index)} 
                        selectedOption={{...token, usdPrice: prettyNumber(usdPrice,2)}} 
                        setSelectedOption={selectToken} 
                        onMaxClick={() => updateAmount(token.balance, token.network, index, true)}
                    />
                }
                <Checkbox textColor='#3C5B7E' value={singleLp} onChange={() =>  setSingleLp(!singleLp)}>Single Asset LP</Checkbox>
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