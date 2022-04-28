import { Group, FormItem, Div } from "@vkontakte/vkui";
import PoolAmountInput from "../uikit/RemoveAmountInput";
import { connect } from "react-redux";
import { estimateExitPool } from "../../networking/osmosisMethods/poolMethods";
import text from "../../text.json";
import { useState } from "react";
import { prepareExitPoolTransaction } from "../../store/actions/poolActions";
const RemoveLiquidity = (props) => {
  const { pool } = props.poolReducer;
  let headerTitle = "Pool #" + pool.id + " ";
  pool.poolInfo.map((item, i) => {
    if (i == pool.poolInfo.length - 1) {
      headerTitle += item.symbol;
    } else {
      headerTitle += item.symbol + "/";
    }
  });
  const [error, setError] = useState(false);
  const [shareInAmount, setAmount] = useState(false);
  const [poolAmounts, setPoolAmounts] = useState([]);
  const updateAmount = (val, isMax = false) => {
    if (val.length) {
      if (+pool.gammShare?.toString() > 0) {
        let amount = isMax ? pool.gammShare.toString() : val;
        setAmount(amount);
        const amounts = estimateExitPool(amount, pool) || poolAmounts;
        const balance = pool.gammShare.maxDecimals(6).toString();
        setError(+balance < +val);
        setPoolAmounts(amounts);
      } else {
        setError(true);
      }
    } else {
      setError(true);
    }
  };
  const prepareExitPool = () => {
    if (!error) {
      props.prepareExitPoolTransaction(poolAmounts, shareInAmount);
    }
  };
  return (
    <Group>
      <FormItem className="bond-control" top={headerTitle}>
        <PoolAmountInput
          hideLp={false}
          setAmount={updateAmount}
          hideFee={true}
          amount={0}
          symbol={"GAMM/" + pool.id}
        />
      </FormItem>
      <Div>
        <h3 className="receive-h3">{text.YOU_RECEIVE}</h3>
        <Div className="receive-block">
          {pool.poolAssets.map((token, i) => (
            <div className="pool-tokens-row" key={i}>
              <h2>{pool.poolInfo[i].symbol}</h2>
              <p>
                {poolAmounts[i]?.maxDecimals(4).toString() || 0}{" "}
                <span>{pool.poolInfo[i].symbol}</span>
              </p>
            </div>
          ))}
        </Div>
      </Div>
      <Div
        className="control-btn"
        id={error ? "disabled-btn" : undefined}
        onClick={() => prepareExitPool()}
      >
        {error ? (
          <span>{text.ERRORS.INSUFFICIENT_FUNDS}</span>
        ) : (
          <span>{text.REMOVE_LIQUIDITY}</span>
        )}
      </Div>
    </Group>
  );
};
const mapStateToProps = (state) => ({
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { prepareExitPoolTransaction })(
  RemoveLiquidity
);
