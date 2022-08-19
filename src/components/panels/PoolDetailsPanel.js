import React, { useState, useMemo, useEffect } from 'react'
import { Header, NoValidatorCard, ValidatorCard, Content, GuideCard, SelectedCard, CoinIcons, InfoCardBlock, InfoCardItem, BigButtons } from '@citadeldao/apps-ui-kit/dist/main'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom';
import BigNumber from "bignumber.js";
import { useLocation } from 'react-router-dom';
import { prettyNumber } from "../helpers/numberFormatter";
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import { panelActions, poolActions } from '../../store/actions';
import { getGammInfo, calculateOsmoEquivalent } from '../../networking/osmosisMethods/poolMethods'
import ROUTES from '../../routes';
const PoolDetailsPanel = (props) => {
    const { pool, superfluidDelegations } = useSelector(state => state.pool)
    const { stakeNodes } = useSelector(state => state.wallet)
    console.log(pool)
    const superfluidDelegatedValidators = stakeNodes?.filter(activeValidator =>
		superfluidDelegations?.superfluid_delegation_records?.some(delegation => delegation.validator_address === activeValidator.address && delegation.delegation_amount.denom === 'gamm/pool/'+pool.id)
	);
    const showSuperfluidDelegations = pool.isSuperfluidPool && superfluidDelegatedValidators && superfluidDelegatedValidators.length > 0 ? true : false;
    const poolShareCurrency = getGammInfo(pool.id)
    const showSelectValidator = pool.lockDurations?.find(item => item.duration === 14)?.lockup?.lockIds?.length > 0
    const totalDelegations = useMemo(() => {
		let r = new CoinPretty(poolShareCurrency, new Dec(0));
		if (showSuperfluidDelegations) {
			for (const del of superfluidDelegations?.total_delegated_coins.filter(delegation => delegation.denom === 'gamm/pool/'+pool.id)) {
				r = r.add(new Dec(del.amount));
			}
		}
		return r;
        // eslint-disable-next-line
	}, [poolShareCurrency, superfluidDelegations]);
    const [amount,seAmount] = useState(0)
    const location = useLocation()
    useEffect(() => {  
        // panelActions.setPreviousPanel(location.pathname)
        async function fetchData() {
            let res = await calculateOsmoEquivalent(totalDelegations,pool.id)  
            seAmount(res)
          }
        fetchData();
        // eslint-disable-next-line
    },[totalDelegations])
    const navigate = useNavigate()
    const [radio, setRadio] = useState('')

    useEffect(() => {
        panelActions.setPreviousPanel(location.pathname)
    },[location])
    
    const radioChangeHandler = (id) => {
        setRadio(id)
    }
    const back = () => navigate(ROUTES.POOLS)
    let headerTitle = "Pool #" + pool.id + " ";
    pool.poolInfo?.forEach((item, i) => {
        if (i === pool.poolInfo.length - 1) {
          headerTitle += item.symbol;
        } else {
          headerTitle += item.symbol + "/";
        }
    });

    const myLiquidity = +pool?.myLiquidity?.toString().replace("$", "").replace(",", "").replace("<", "")
    const bondData = {
        bondedTxt: 'Bonded LP tokens',
        bondedAmount: prettyNumber(+pool?.myLiquidity?.toString().replace("$", "").replace(",", "").replace("<", "") - +pool?.availableLP?.toString().replace("$", "").replace("<", ""),2),
        availableTxt: 'Available LP tokens',
        availableAmount: prettyNumber(pool?.availableLP?.toString().replace("$", ""),2)
    }
   
    return (
        <section className='panel pool-details-panel'>
            <Content>
                <Header border title={headerTitle} style={{margin: '8px 0 16px 0'}} onClick={() => back()} back={true}/>
                <InfoCardBlock>
                    <InfoCardItem text={'Liquidity pool'} symbol={'$'}><span className='purple-text'>{pool.poolTVL?.toString().replace("$", "") || '-'}</span></InfoCardItem>
                    <InfoCardItem text={'Swap fee'} symbol={'%'}><span className='pink-text'> {+pool.poolParams?.swapFee > 0 ? BigNumber(+pool.poolParams?.swapFee * 100).toFixed() : 0}{" "}</span></InfoCardItem>
                    <InfoCardItem text={"Pool catalyst"}><p>{pool.poolAssets?.map((item, i) =>
                        i === pool.poolAssets.length - 1 ? (
                        <span className="pool-purple-text" key={i}>
                            {parseInt((+item.weight * 100) / +pool.totalWeight)}{" "}
                            <span> % {pool.poolInfo[i]?.symbol} </span>{" "}
                        </span>
                        ) : (
                        <span className="pool-purple-text" key={i}>
                            {parseInt((+item.weight * 100) / +pool.totalWeight)}{" "}
                            <span> % {pool.poolInfo[i]?.symbol} /</span>{" "}
                        </span>
                        )
                    )}</p>
                    </InfoCardItem>
                </InfoCardBlock>
                <div className='pool-amounts-row'>
                    <h3>Your amount</h3>
                    <div className='pool-amount-block'>
                        <h2 className='amount-purple-text'>{pool?.myLiquidity?.toString().replace("$", "") || 0} <span>$</span></h2>
                        <p>
                        {pool.myAmounts &&
                            pool.myAmounts?.map((item, i) =>
                            i === pool.myAmounts?.length - 1 ? (
                                <span className="pool-green-text" key={i}>
                                {prettyNumber(item,2)}{" "}
                                <span> {pool.poolInfo[i]?.symbol} </span>{" "}
                                </span>
                            ) : (
                                <span className="pool-green-text" key={i}>
                                {prettyNumber(item,2)}{" "}
                                <span> {pool.poolInfo[i]?.symbol} /</span>{" "}
                                </span>
                            )
                            )}
                        </p>
                    </div>
                    <div className='pool-liquidity-btns-row'>
                        <BigButtons onClick={() => navigate(ROUTES.ADD_LIQUIDITY)} text='Add Liquidity' textColor='#FFFFFF' bgColor='#7C63F5'  hideIcon={true}/>
                        <BigButtons onClick={() => navigate(ROUTES.REMOVE_LIQUIDITY)} text='Remove Liquidity' textColor='#FFFFFF' bgColor='#0095D6'  hideIcon={true}/>
                    </div>
                </div>
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
                        changed={() => radioChangeHandler(item?.duration)} 
                        value={item?.duration}
                        icon={pool.isSuperfluidPool && item.duration === 14 ? <CoinIcons icon='osmosis' color='#5639E0' size='small'/> : null}
                        isSelected={radio === item?.duration}
                        selectedColor="#F1EEFF"
                        borderColor="#7C63F5"
                     />
                    ))}
                </div>
                {!showSuperfluidDelegations && pool.isSuperfluidPool && showSelectValidator &&
                    <NoValidatorCard 
                        style={{marginTop: '24px'}} 
                        text="My Superfluid Validator" 
                        label="no validator"
                        onClick={() => navigate(ROUTES.SELECT_VALIDATOR)}
                    />
                }
                {showSuperfluidDelegations && pool.isSuperfluidPool && superfluidDelegatedValidators.map((node,i) => (
                    <ValidatorCard 
                        validatorData={node} 
                        text2={'My Superfluid Delegation'}
                        style={{marginTop: '24px'}} 
                        text="My Superfluid Validator" 
                        key={i} 
                        amount={amount}
                        symbol={'OSMO'}
                        /> )) 
                }
                {myLiquidity > 0 && 
                    <div onClick={() => {
                            navigate(ROUTES.MANAGE_BOND); 
                            poolActions.setSelectedNode(null);
                            poolActions.setIsSuperfluidLock(showSuperfluidDelegations)}
                        }>
                        <GuideCard 
                            title='Manage your bond' 
                            background='linear-gradient(90deg, rgba(212, 252, 121, 0.2) 0%, rgba(150, 230, 161, 0.2) 100%)' 
                            textColor='#003910' 
                            info={true} 
                            arrowColor='#1C622F' 
                            data={bondData}
                        />
                    </div>    
                }
            </Content> 
        </section>
    )
}

export default PoolDetailsPanel