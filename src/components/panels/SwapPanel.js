import React, {useState,useEffect} from 'react';
import { Content, CustomIcon, Tabbar, EditAmount, SelectToken, InfoCardBlock, InfoCardItem} from '@citadeldao/apps-ui-kit/dist/main';
import { Config } from '../config/config';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { panelActions, swapActions } from '../../store/actions';
import { useNavigate } from 'react-router-dom';
import { prettyNumber } from "../helpers/numberFormatter";
import '../styles/panels/swap.css';
import ROUTES from '../../routes';
import BigNumber from "bignumber.js";
import SwapButton from '../uikit/SwapButton';
import { getSymbol } from '../helpers/index';
//import ConfirmModal from '../uikit/ConfirmModal';
const SwapPanel = () => {
    const config = new Config()
    const navigate = useNavigate()
    const { activeWallet } = useSelector((state) => state.wallet)
    const { bottomInset } = useSelector(state => state.panels)
    const [balanceView, setBalanceView] = useState('View Balance')
    const { independentField, swapPools, routes, swapFee, slippageTolerance,  slippage, outAmout, fromUSD, rate, isExactIn, toUSD, amount, tokenIn, tokenOut } = useSelector(state => state.swap)
    const { tokens } = useSelector(state => state.wallet)
    const [slippageToleranceValue, setSlippage] = useState(slippageTolerance)
    const [isExact, setExactIn] = useState(isExactIn);
    const location = useLocation()
    const dispatch = useDispatch()
    useEffect(() => {
        panelActions.setPreviousPanel(location.pathname)
        if(swapPools){
            dispatch(swapActions.getSwapInfo(formattedAmounts[independentField], isExact));
        } 
        // eslint-disable-next-line 
      }, [tokenIn, tokenOut, swapPools, activeWallet,  amount]);
    const dependentField = independentField === "INPUT" ? "OUTPUT" : "INPUT";
    const parsedAmounts = {
        INPUT: independentField === "INPUT" ? amount : outAmout,
        OUTPUT: independentField === "OUTPUT" ? amount : outAmout,
    };
    const formattedAmounts = {
        [independentField]: prettyNumber(amount,+tokenIn?.decimals),
        [dependentField]: prettyNumber(parsedAmounts[dependentField],+tokenOut?.decimals),
      };
    const reverseTokens = () => {
        dispatch(swapActions.setIndependentField(dependentField));
        dispatch(swapActions.setTokenIn(tokenOut));
        dispatch(swapActions.setTokenOut(tokenIn));
        dispatch(swapActions.setAmount(formattedAmounts[independentField],!isExact));
        dispatch(swapActions.getSwapInfo(formattedAmounts[independentField],!isExact));
        setExactIn(!isExact)
    };
    const setSelectedOption = (name) => {
        dispatch(swapActions.setIndependentField("INPUT"));
        setExactIn(true)
        dispatch(swapActions.setAmount(formattedAmounts["INPUT"],true));
        dispatch(swapActions.setSelectedToken(name))
        navigate(ROUTES.SELECT_TOKEN)
    }
    const setMaxValue = (val) => {
        setExactIn(true);
        dispatch(swapActions.setIndependentField(val));
        formattedAmounts[val] = tokenIn.balance
        if(formattedAmounts[val] === 0 || formattedAmounts[val] === '~0'){
            dispatch(swapActions.setSwapStatus('insufficientBalance'))
            formattedAmounts[val] = 0
        }
        let currentToken = val === "INPUT" ? tokenIn : tokenOut
        if(currentToken.code === 'OSMO' && formattedAmounts[val] > 0.1){
            formattedAmounts[val] = formattedAmounts[val] - 0.1
        }
        dispatch(swapActions.setAmount(formattedAmounts[val],val === "INPUT" ? true : false));
        dispatch(swapActions.getSwapInfo(formattedAmounts[val],val === "INPUT" ? true : false));
    }

    const checkAmount = (val,name) => {
        // eslint-disable-next-line 
        val = val.replace(/[^0-9\.]/g, "");
        if(val.split(".").length - 1 !== 1 && val[val.length-1] === '.') return
        if (
          val.length === 2 &&
          val[1] !== "." &&
          val[1] === "0"
        ) {
            dispatch(swapActions.setAmount(val,name === "INPUT" ? true : false));
        } else if (val[0] === "0" && val[1] !== ".") {
            dispatch(swapActions.setAmount(BigNumber(val).toFixed(),name === "INPUT" ? true : false));
        } else {
            dispatch(swapActions.setAmount(val,name === "INPUT" ? true : false));
        }
        dispatch(swapActions.setIndependentField(name));
        setExactIn(name === "INPUT" ? true : false);
        dispatch(swapActions.getSwapInfo(val,name === "INPUT" ? true : false));
      };
    const setSlippageTolerance = (val) => {
        setSlippage(val)
        dispatch(swapActions.setSlippageTolerance(val))
    }
    return (
        <div className='panel'>
            <Content>
                <div className='swap-inputs'>
                    <SelectToken 
                        max={true} 
                        usdPrice={prettyNumber(fromUSD * formattedAmounts["INPUT"],2)} 
                        balance={true} 
                        token={true} 
                        data={tokens} 
                        style={{marginBottom: '30px'}}
                        action={true}
                        field='from'
                        name='INPUT'
                        title="From token"
                        checkValue={() => {}}
                        onMaxClick={() => setMaxValue('INPUT')}
                        checkAmount={checkAmount}
                        value={formattedAmounts["INPUT"]} 
                        selectedOption={{...tokenIn, balance: prettyNumber(tokenIn?.balance)}} 
                        balanceView={balanceView} setBalanceView={setBalanceView} 
                        onClick={() => setSelectedOption('INPUT')}
                        />
                    <CustomIcon onClick={reverseTokens} icon='swap-icon' id='swap-center-btn' />
                    <SelectToken 
                            balance={true} 
                            usdPrice={prettyNumber(toUSD * formattedAmounts["OUTPUT"],2)}
                            token={true} 
                            data={tokens} 
                            action={true}
                            field='to'
                            name='OUTPUT'
                            title="To token"
                            checkValue={() => {}}
                            onMaxClick={() => setMaxValue('OUTPUT')}
                            checkAmount={checkAmount}
                            value={formattedAmounts["OUTPUT"]}
                            selectedOption={{...tokenOut, balance: prettyNumber(tokenOut?.balance)}} 
                            balanceView={balanceView} setBalanceView={setBalanceView} 
                            onClick={() => setSelectedOption('OUTPUT')}
                        />
                </div>
            <InfoCardBlock style={{marginTop: '10px'}}>
                <InfoCardItem text={'Price'} symbol={tokenOut?.code} symbol2={tokenIn?.code}><span className='purple-text'>{rate || '-'}</span></InfoCardItem>
                <InfoCardItem text={'Swap Fee'} symbol={'%'}><span className='pink-text'> {+swapFee > 0 ? BigNumber(swapFee * 100).toFixed(3) : 0}{" "}</span></InfoCardItem>
                <InfoCardItem text={'Route'} > 
                <span className="route-row">{routes ? routes?.map((item,i) =>(
            i===0 ?
              <span key={i}>{ getSymbol(item?.from, tokens) }
              <CustomIcon icon={'right'} color='#A8C3E1' />{ getSymbol(item?.to, tokens) }</span>
            :
              <span key={i}><CustomIcon icon={'right'} color='#A8C3E1' />{ getSymbol(item?.to, tokens) } </span>
            )) : '-'}
            </span>
            </InfoCardItem>
            <InfoCardItem text={'Estimated slippage'} symbol={'%'} footer>
                {+slippage > 0 ? BigNumber(slippage * 100).toFixed(3) === '0.000' ? '<0.001' : BigNumber(slippage * 100).toFixed(3) : 0}{" "} %
            </InfoCardItem>
            </InfoCardBlock>
            <EditAmount data={{code: '%'}} style={{marginTop: '20px'}} text={'Slippage tolerance'} value={slippageToleranceValue} minValue={0} saveValue={() => {}} maxValue={100000}  setValue={setSlippageTolerance} />
            <SwapButton amounts={formattedAmounts}/>
            </Content>
            {/* <ConfirmModal /> */}
            <Tabbar config={config}  bottomInset={bottomInset}/>
        </div>
    )
}

export default SwapPanel