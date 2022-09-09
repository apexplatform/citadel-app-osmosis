import { Button } from '@citadeldao/apps-ui-kit/dist/main';
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
            {swapStatus === 'enterAmount' && <Button disabled style={customStyle} textColor='#FFFFFF' bgColor='#7C63F5' hidename={true}>ENTER AMOUNT</Button>}
            {swapStatus === 'swap' && <Button disabled={disableSwap} onClick={() => swapActions.getSwapTransaction(props.amounts)} style={{marginTop: '20px'}} textColor='#FFFFFF' bgColor='#7C63F5' hoverBgColor='#5639E0'>SWAP</Button>}
            {swapStatus === 'swapAnyway' && <Button disabled={disableSwap}  onClick={() => swapActions.getSwapTransaction(props.amounts)} style={customStyle} textColor='#FFFFFF' bgColor='#FF5722' hoverBgColor='#5639E0'>SWAP ANYWAY</Button>}
            {swapStatus === 'insufficientBalance' && <Button disabled style={customStyle} textColor='#FFFFFF' bgColor='#7C63F5'>{`Insufficient ${tokenIn.code} balance`}</Button>}
            {swapStatus === 'feeError' && <Button disabled style={customStyle} textColor='#FFFFFF' bgColor='#7C63F5'>Insufficient balance for swap fee</Button>}
            {swapStatus === 'disabled' && <Button disabled style={customStyle} textColor='#FFFFFF' bgColor='#7C63F5'>SWAP</Button>}
        </div>
	); 
}
export default SwapButton