import React, {useState, useEffect} from 'react';
import { Content, Tabbar, Search, Tablist, Tab, PoolItemInfo, Loader } from '@citadeldao/apps-ui-kit/dist/main';
import PoolItem from '@citadeldao/apps-ui-kit/dist/components/uiKit/PoolItem'
import { Config } from '../config/config';
import { useSelector } from 'react-redux';
import { sortPoolList, sortAllPoolList, getMyPoolList } from "../helpers/index";
import BigNumber from "bignumber.js";
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { panelActions, poolActions } from '../../store/actions';
import { prettyNumber } from '../helpers/numberFormatter'
import ROUTES from '../../routes';
const PoolsPanel = () => {
    const config = new Config()
    const [active, setActive] = useState('tab1')
    const { bottomInset } = useSelector(state => state.panels)
    const { incentivizedPools, allPools } = useSelector(state => state.pool);
    const [searchText, setSearchText] = useState("");
    const [myPools, setMyPools] = useState(
      allPools?.length ? getMyPoolList(allPools) : null
    );
    const [allPoolsList, setAllPools] = useState(
      allPools?.length ? sortAllPoolList(allPools) : null
    );
    const [incentivizedList, setIncentivizedList] = useState(
      incentivizedPools?.length ? sortPoolList(incentivizedPools) : null
    );
    const findPool = (pool, name) => {
        let str =
          "pool#" + pool.id + pool.poolInfo[0]?.symbol + pool.poolInfo[1]?.symbol;
        if (str.toLowerCase().includes(name.toLowerCase())) {
          return true;
        }
        return false;
      };
    const searchPool = (name) => {
        setSearchText(name);
        if (name.length >= 1) {
          if (active === "tab1") {
            setAllPools(allPools.filter((pool) => findPool(pool, name)));
          }
          if (active === "tab2") {
            setIncentivizedList(
              incentivizedPools.filter((pool) => findPool(pool, name))
            );
          }
          if (active === "tab3") {
            setMyPools(
              myPools.filter((pool) => findPool(pool, name))
            );
          }
        } else {
          if (active === "tab1") {
            setAllPools(allPools);
          }
          if (active === "tab2") {
            setIncentivizedList(incentivizedPools);
          }
          if (active === "tab3") {
            setMyPools(getMyPoolList(allPools));
          }
        }
      };
    const location = useLocation()
    const navigate = useNavigate()
    useEffect(() => {
      setAllPools(allPools ? sortAllPoolList(allPools) : null);
      setMyPools(allPools ? getMyPoolList(allPools) : null);
      setIncentivizedList(
        incentivizedPools ? sortPoolList(incentivizedPools) : null
      );
      panelActions.setPreviousPanel(location.pathname)
      // eslint-disable-next-line
    }, [incentivizedPools, allPools]);
    const openPool = (pool) => {
      poolActions.setSelectedPool(pool)
      navigate(ROUTES.POOL_DETAILS)
      poolActions.setIsSuperfluidLock(false)
    }
    return (
        <div className='panel'>
            <Content>
                  <Tablist active={active} setActive={setActive} type="button">
                    <Tab id='tab1' label='All'>
                        <Search value={searchText} onChange={searchPool} style={{margin: '10px 0 16px'}} placeholder='Start typing..'/>
                        {
                            allPoolsList?.length ? allPoolsList?.map((pool,i) => (
                                <PoolItem  
                                    key={i}
                                    id={pool.id}
                                    onClick={() => openPool(pool)}
                                    apr={+pool.apr/100}
                                    poolAssets={pool.poolInfo}
                                    isSuperfluidPool={pool.isSuperfluidPool}
                                    superFluidAPR={prettyNumber(+pool.superFluidAPR,2)}
                                    network={'osmosis'}
                                    style={{marginBottom: "16px"}}
                                    poolInfo>
                                    <PoolItemInfo text='Liquidity provider fee' amount={BigNumber(pool.poolParams?.swapFee * 100).toFixed(1)} symbol='%' textColor='#D900AB' symbolColor='#59779A'/>
                                    <PoolItemInfo text='Pool liquidity' amount={pool.poolTVL?.toString().replace("$", "")} symbol='$' textColor='#5639E0' symbolColor='#292929'/>
                                    <PoolItemInfo text='My liquidity' amount={pool.myLiquidity} symbol='$' textColor='#0F8932' symbolColor='#292929'/>
                                </PoolItem>
                            )) : <Loader />
                        }  
                    </Tab>
                    <Tab id='tab2' label='Incentivized Pools'>
                        <Search value={searchText} onChange={searchPool} style={{margin: '10px 0 16px'}} placeholder='Start typing..'/>
                        {
                          incentivizedList?.length ? incentivizedList?.map((pool,i) => (
                                <PoolItem  
                                    key={i}
                                    id={pool.id}
                                    onClick={() => openPool(pool)}
                                    apr={+pool.apr/100}
                                    poolAssets={pool.poolInfo}
                                    isSuperfluidPool={pool.isSuperfluidPool}
                                    superFluidAPR={prettyNumber(+pool.superFluidAPR,2)}
                                    network={'osmosis'}
                                    style={{marginBottom: "16px"}}
                                    poolInfo>
                                    <PoolItemInfo text='Liquidity provider fee' amount={BigNumber(pool.poolParams?.swapFee * 100).toFixed(1)} symbol='%' textColor='#D900AB' symbolColor='#59779A'/>
                                    <PoolItemInfo text='Pool liquidity' amount={pool.poolTVL?.toString().replace("$", "")} symbol='$' textColor='#5639E0' symbolColor='#292929'/>
                                    <PoolItemInfo text='My liquidity' amount={pool.myLiquidity} symbol='$' textColor='#0F8932' symbolColor='#292929'/>
                                </PoolItem>
                            )) : <Loader />
                        }  
                    </Tab>
                    <Tab id='tab3' label='My Pools'>
                        <Search  value={searchText} onChange={searchPool} style={{margin: '10px 0 16px'}} placeholder='Start typing..'/>
                        {
                          myPools?.length ? myPools?.map((pool,i) => (
                                <PoolItem  
                                    key={i}
                                    onClick={() => openPool(pool)}
                                    id={pool.id}
                                    apr={+pool.apr/100}
                                    poolAssets={pool.poolInfo}
                                    isSuperfluidPool={pool.isSuperfluidPool}
                                    superFluidAPR={prettyNumber(+pool.superFluidAPR,2)}
                                    network={'osmosis'}
                                    style={{marginBottom: "16px"}}
                                    poolInfo>
                                    <PoolItemInfo text='Liquidity provider fee' amount={BigNumber(pool.poolParams?.swapFee * 100).toFixed(1)} symbol='%' textColor='#D900AB' symbolColor='#59779A'/>
                                    <PoolItemInfo text='Pool liquidity' amount={pool.poolTVL?.toString().replace("$", "")} symbol='$' textColor='#5639E0' symbolColor='#292929'/>
                                    <PoolItemInfo text='My liquidity' amount={pool.myLiquidity} symbol='$' textColor='#0F8932' symbolColor='#292929'/>
                                </PoolItem>
                            )) : 
                            <div className="no-transactions-block">
                              <img src='img/no-pools.svg' alt='noTransactions'/>
                              <h3>No pools yet</h3>
                              <p>Pools will appear upon addition.<br/>
                                You can add them via the search Tababove. </p>
                            </div>
                        }  
                    </Tab>
                </Tablist> 
            </Content>
            <Tabbar config={config}  bottomInset={bottomInset}/>
        </div>
    )
}

export default PoolsPanel