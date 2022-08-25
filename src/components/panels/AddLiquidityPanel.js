import React, { useState } from 'react';
import { Content, Header, SelectInput, CustomIcon, AmountInput, SmallCheckbox, BigButtons } from '@citadeldao/apps-ui-kit/dist/main';
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
    pool.poolAssets.forEach((item, index) => {
        initialAmounts.push({
            index: index,
            amount: 0,
            denom: item.token.denom,
            decimals: pool.poolCoinInfo[index].coinDecimals,
            code: pool.poolCoinInfo[index].coinDenom,
            net: 'osmosis',
            network: pool.poolCoinInfo[index].coinDenom,
            balance: tokens.find(elem => elem.code === pool.poolCoinInfo[index].coinDenom)?.balance || 0
        });
    });
    
    const prettyBalanceList = [];
    tokenBalances.forEach((item) => {
        pool.poolAssets.forEach((pool) => {
            if (item.denom === pool.token.denom) {
                prettyBalanceList.push(item);
            }
        });
    });
    const [shareOutAmount, setShareOutAmount] = useState(null);
    const [amounts, setAmount] = useState(initialAmounts);
    const [singleLp, setSingleLp] = useState(false);
    const [index, setIndex] = useState(0);
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
                setAmount(temp);
                setUsdPrice(price * +temp[index].amount);
                checkErrors(temp[index])
            } else {
                setUsdPrice(price * +amount);
                const tokenInAmount = new IntPretty(new Dec(amount));
                const totalShare = new IntPretty(
                    pool.totalShares.amount
                ).moveDecimalPointLeft(18);
                const currentPoolDenom = amounts[index].denom;
                const currentAsset = pool.poolAssets.find(
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
                const otherPoolAsset = pool.poolAssets.find(
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
            if (prettyBalanceList.length < pool.poolAssets.length || +balance < +amount) {
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
    const [token,setToken] = useState(amounts[index])
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
                        style={{marginBottom : '14px'}} 
                        value={token.amount} 
                        setValue={(value) => updateAmount(value, token.network, index)} 
                        selectedOption={{...token, usdPrice: prettyNumber(usdPrice,2)}} 
                        setSelectedOption={selectToken} 
                        onMaxClick={() => updateAmount(token.balance, token.network, index, true)}
                    />
                }
                <SmallCheckbox text="Single Asset LP" textColor='#3C5B7E' isChecked={singleLp} disabled={false} onClick={() =>  setSingleLp(!singleLp)}/>
                {error && <div className='row' id='amount-error'>
                    <CustomIcon icon='alarm' color='#EA2929' size = 'small' />
                    <p>{error}</p>
                </div>}
                <div className='center'>
                    <BigButtons disabled={error} onClick={() => prepareJoinPool()} style={{marginTop: '16px'}} text='Add' textColor='#FFFFFF' bgColor='#7C63F5'  hideIcon={true}/>
                </div>
            </Content>
        </div>
    )
}

export default AddLiquidityPanel