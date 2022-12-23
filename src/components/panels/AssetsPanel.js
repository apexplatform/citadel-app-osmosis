import React, { useEffect, useState } from "react"
import { BalanceInfoCard, AddressCard, BalanceInfoCardItem, Toggle, Loader } from "@citadeldao/apps-ui-kit/dist/main"
import { useSelector } from "react-redux"
import { prettyNumber } from '../helpers/numberFormatter'
import { getMyPoolList, sortAssetsList, sortPoolAssetsList } from "../helpers/index";
import { formatAddress } from '../helpers/addressFormatter'
import { poolActions } from '../../store/actions';
import ROUTES from '../../routes';
import { useNavigate } from 'react-router-dom';
const Assets = () => {
    const { tokens, activeWallet, usdPrice } = useSelector((state) => state.wallet)
    const { allPools, incentivizedPools } = useSelector((state) => state.pool)
    const { loader } = useSelector((state) => state.panels)
    const [showPools, setShowPools] = useState(false)
    const [poolAssetsList, setPoolAssetsList] = useState([]);
    const [assetsList, setAssetsList] = useState([]);
    const navigate = useNavigate()
    let bondedBalance = 0;
    incentivizedPools?.forEach((elem) => {
      if (elem.myLockedAmount !== "$0") {
        bondedBalance += +elem.myLockedAmount
          .toString()
          .replace("$", "")
          .replace(",", "");
      }
    });
    let availableBalance = 0;
    allPools?.forEach((elem) => {
      if (+elem.availableLP.replace("$", "").replace(",", "") !== 0) {
        availableBalance += +elem.availableLP
          .toString()
          .replace("$", "")
          .replace("<", "")
          .replace(",", "");
      }
    });
    tokens?.forEach((elem) => {
        if (elem.balance > 0) {
          if (elem.code === "OSMO") {
            availableBalance += +elem.balance * +usdPrice;
          } else {
            availableBalance += +elem.balance * +elem.USD;
          }
        }
      });
    useEffect(() => {
      let pools = allPools?.length ? getMyPoolList(allPools) : null;
      let poolAssets = pools?.map((item) => {
        return {
          name: "Pool #" + item.id,
          logoURI: "img/tokens/osmosis.svg",
          usdPrice: +item.myLiquidity.replace("$", "").replace(",", ""),
          code: "GAMM/" + item.id,
          symbol:
            (item.poolInfo[0]?.symbol || formatAddress(item.poolInfo[0]?.denom)) +
            "/" +
            (item.poolInfo[1]?.symbol || formatAddress(item.poolInfo[1]?.denom)),
          balance: item.allGammShare?.maxDecimals(6).trim(true).toString() || 0,
          pool: item,
        };
      });
      const assets = tokens
      ?.filter((elem) => elem.balance > 0 || elem.code === "OSMO")
      ?.map((elem) => {
        if (elem.code === "OSMO") {
          elem.usdPrice = activeWallet?.balance?.mainBalance * +usdPrice;
          elem.balance = activeWallet?.balance?.mainBalance;
        } else {
          elem.usdPrice = +elem.balance * +elem.USD;
        }
        return elem;
      });
      setPoolAssetsList( poolAssets ? sortPoolAssetsList(poolAssets) : [])
      setAssetsList( assets ? sortAssetsList(assets) : [])
      // eslint-disable-next-line
    },[allPools])
    const stakedBalance = activeWallet?.balance?.stake * usdPrice || 0;
    const totalBalance = +availableBalance + +stakedBalance + +bondedBalance;
    const openPool = (pool) => {
      poolActions.setSelectedPool(pool)
      navigate(ROUTES.POOL_DETAILS)
    }
    return (
        <div className='tab-content'>
            <BalanceInfoCard  style={{marginBottom:'10px'}} >
                <BalanceInfoCardItem title='Total assets' textColor='#59779A' amountColor='#5639E0' usdSymbol='$'>{loader ? '-' : prettyNumber(totalBalance, 2)} </BalanceInfoCardItem>
                <BalanceInfoCardItem title='Available assets' textColor='#59779A' amountColor='#D900AB' usdSymbol='$'>{loader ? '-' : prettyNumber(availableBalance, 2)}</BalanceInfoCardItem>
                <BalanceInfoCardItem title='Bonded assets' textColor='#59779A' amountColor='#D85830' usdSymbol='$'>{loader ? '-' : prettyNumber(bondedBalance, 2)} </BalanceInfoCardItem>
                <BalanceInfoCardItem title='Staked OSMO' textColor='#59779A' amountColor='#00B2FE' usdSymbol='$'>{loader ? '-' : prettyNumber(stakedBalance, 2)} </BalanceInfoCardItem>
            </BalanceInfoCard>
            <Toggle value={showPools} onChange={setShowPools} label="Pool assets" style={{margin: '16px 0'}}/>
            { !showPools
            ? assetsList.length ? assetsList?.map((item, i) => (
                <AddressCard 
                    data={{...item, balance: prettyNumber(item?.balance)}} 
                    coin 
                    key={i} 
                    style={{marginBottom:'10px'}} 
                    logoURI={item?.logoURI} 
                    className='asset-item'
                />
              )) : loader ? <Loader /> : <p className='center'>No assets</p>
            : poolAssetsList.length ? poolAssetsList?.map((item, i) => (
                <AddressCard
                    data={{...item, balance: prettyNumber(item?.balance)}} 
                    coin 
                    key={i} 
                    manage
                    style={{marginBottom:'10px'}} 
                    className='asset-item'
                    onClick={() => openPool(item.pool)}
                    logoURI={item?.logoURI} 
                />
              )) : loader ? <Loader /> : <p className='center'>No pool assets</p>
              }
        </div>
    )
}

export default Assets