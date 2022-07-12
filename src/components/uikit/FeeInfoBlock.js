import { connect } from "react-redux";
import "../styles/components/feeInfoBlock.css";
import BigNumber from "bignumber.js";
import { Icon20ChevronRightOutline } from "@vkontakte/icons";
const FeeInfoBlock = (props) => {
  const { fromToken, toToken, tokenList } = props.walletReducer;
  const { slippage, poolInfo, swapFee } = props.swapReducer;
  const fromCode = props.isExactIn ? fromToken?.code : toToken?.code;
  const toCode = !props.isExactIn ? fromToken?.code : toToken?.code;
  const getSymbol = (token) => {
    if(token.symbol !== "") {
      return token.symbol
    } else {
      let item = tokenList.find(elem => elem.fullDenom == token.denom)
      if(item){
        return item.code
      }else{
        return '-'
      }
    }
  }
  return (
    <div className="fee-info-block">
      <div className="fee-row">
        <span className="fee-text">Rate</span>
        {props.rate ? (
          <span>
            <span className="fee-text">1 </span>
            {fromCode} =<span className="fee-text"> {props.rate} </span>
            {toCode}
          </span>
        ) : (
          <span>-</span>
        )}
      </div>
      <div className="fee-row">
        <span className="fee-text">Swap fee</span>
        <span>
          <span className="fee-text">
            {" "}
            {+swapFee > 0 ? BigNumber(swapFee * 100).toFixed(3) : 0}{" "}
          </span>{" "}
          %
        </span>
      </div>
      <div className="fee-row">
        <span className="fee-text">Route</span>
        <span>
          <span className="route-row">{poolInfo ? poolInfo?.map((item,i) =>(
            i==0 ?
              <span key={i}>{ getSymbol(item?.from) }
              <Icon20ChevronRightOutline fill="#C5D0DB" width={25} height={25} />{ getSymbol(item?.to) }</span>
            :
              <span key={i}><Icon20ChevronRightOutline fill="#C5D0DB" width={25} height={25} />{ getSymbol(item?.to) } </span>
            )) : '-'}</span>
        </span>
      </div>
      <div className="separator"></div>
      <div className="fee-row">
        <span className="fee-text-bold">Estimated slippage</span>
        <span>
          <span className="fee-amount-bold">
            {+slippage > 0 ? BigNumber(slippage * 100).toFixed(3) == '0.000' ? '<0.001' : BigNumber(slippage * 100).toFixed(3) : 0}{" "}
          </span>
          %
        </span>
      </div>
    </div>
  );
};
const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  swapReducer: state.swapReducer,
});

export default connect(mapStateToProps, {})(FeeInfoBlock);
