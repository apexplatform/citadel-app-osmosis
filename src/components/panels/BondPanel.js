import { useState } from "react";
import { Group, FormItem, Div } from "@vkontakte/vkui";
import UnbondingPeriod from "../uikit/UnbondingPeriod";
import PoolAmountInput from "../uikit/RemoveAmountInput";
import { connect } from "react-redux";
import text from "../../text.json";
import { prepareLockTokensTransaction, prepareLockAndDelegateTransaction } from "../../store/actions/poolActions";
import "../styles/panels/bond-control.css";
import NodeSelect from '../uikit/NodeSelect'
const BondPanel = (props) => {
  const { pool , selectedNode, isSuperfluidLock } = props.poolReducer;
  const [activeOption, setActiveOption] = useState(pool.lockDurations[pool.lockDurations.length-1]);
  const [error, setError] = useState(true);
  const [shareInAmount, setAmount] = useState(false);
  const updateAmount = (val, isMax = false) => {
    if (val.length) {
      if (+pool.gammShare?.toString() > 0) {
        let amount = isMax ? pool.gammShare?.toString() : val;
        setAmount(amount);
        const balance = pool.gammShare?.maxDecimals(6).toString();
        setError(+balance < +val);
      } else {
        setError(true);
      }
    }
    if (+val == 0) {
      setError(true);
    }
  };
  const prepareLockTokens = () => {
    if (!error) {
      if(pool.isSuperfluidPool && selectedNode && activeOption.duration == 14){
        props.prepareLockAndDelegateTransaction(shareInAmount, selectedNode);
      }else{
        props.prepareLockTokensTransaction(shareInAmount, activeOption);
      }
    
    }
  };
  return (
    <Group>
      <FormItem top={text.UNBONDING_PERIOD}>
        <div className="row">
          {pool.lockDurations?.map((item) => (
            <UnbondingPeriod
              setActiveOption={setActiveOption}
              activeOption={activeOption}
              superfluid={+pool.id == 1}
              item={item}
              key={item?.duration}
            />
          ))}
        </div>
      </FormItem>
      <FormItem className="bond-control" top={text.AMOUNT_BOND}>
        <PoolAmountInput
          hideLp={true}
          setAmount={updateAmount}
          hideFee={true}
          amount={0}
          symbol={"GAMM/" + pool.id}
        />
      </FormItem>
      {pool.isSuperfluidPool && !isSuperfluidLock && activeOption?.duration == 14 && 
      <FormItem className="bond-control" top='Validator'>
        <NodeSelect selectedNode={selectedNode}/>
      </FormItem> }
      <div className="bond-info-block">
        <p>{text.BOND_INFO}</p>
      </div>
      <Div
        className="control-btn"
        id={error ? "disabled-btn" : undefined}
        onClick={() => prepareLockTokens()}
      >
        <span>Bond</span>
      </Div>
    </Group>
  );
};
const mapStateToProps = (state) => ({
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { prepareLockTokensTransaction, prepareLockAndDelegateTransaction })(
  BondPanel
);
