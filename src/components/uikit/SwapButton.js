import { BigButtons } from '@citadeldao/apps-ui-kit/dist/main';
import { useSelector } from 'react-redux';
import { swapActions } from '../../store/actions';
const SwapButton = (props) => {
    const { swapStatus, tokenIn, disableSwap } = useSelector((state) => state.swap)
    const customStyle = {
        width: 'auto',
        marginTop: '20px',
    }
	return (
        <div className='center'>
            {swapStatus === 'enterAmount' && <BigButtons text='ENTER AMOUNT' disabled style={customStyle} textColor='#FFFFFF' bgColor='#7C63F5' hideIcon={true}/>}
            {swapStatus === 'swap' && <BigButtons disabled={disableSwap} onClick={() => swapActions.getSwapTransaction(props.amounts)} text='SWAP' style={{marginTop: '20px'}} textColor='#FFFFFF' bgColor='#7C63F5'  hideIcon={true}/>}
            {swapStatus === 'swapAnyway' && <BigButtons disabled={disableSwap}  onClick={() => swapActions.getSwapTransaction(props.amounts)} text='SWAP ANYWAY' style={customStyle} textColor='#FFFFFF' bgColor='#FF5722' hideIcon={true}/>}
            {swapStatus === 'insufficientBalance' && <BigButtons disabled text={`Insufficient ${tokenIn.code} balance`} style={customStyle} textColor='#FFFFFF' bgColor='#7C63F5'  hideIcon={true}/>}
            {swapStatus === 'feeError' && <BigButtons disabled text='Insufficient balance for swap fee' style={customStyle} textColor='#FFFFFF' bgColor='#7C63F5'  hideIcon={true}/>}
        </div>
	); 
}
export default SwapButton