import { Div } from "@vkontakte/vkui";
import { useEffect, useState } from 'react';
import "../styles/components/superFluidBlock.css";
import { connect } from "react-redux";
import text from '../../text.json'
import {calculateOsmoEquivalent} from '../../networking/osmosisMethods/poolMethods'
const SuperFluidBlock = (props) => {
  const { pool } = props.poolReducer;
  const { node, totalDelegations, showSuperfluidDelegations } = props;
  const [amount, setAmount] = useState(0)
  useEffect(async() => {
    if(pool.isSuperfluidPool && showSuperfluidDelegations){
      let amountDec = await calculateOsmoEquivalent(totalDelegations,pool.id)
      amountDec._options.hideDenom = true;
      setAmount(amountDec?.maxDecimals(3).toString())
    }
  },[showSuperfluidDelegations])
  return (
    <Div className="superFluid-block">
      <div className="superFluid-column">
          <h3>{text.SUPERFLUID_VALIDATOR}</h3>
          <div className="superFluid-row">
              <img src={node.imageSource} alt='node' />
              <div>
                  <h4>{node.name}</h4>
                  <p>Fee: <span>{node.fee}</span>%</p>
              </div>
          </div>
      </div>
      <div className="superFluid-column">
          <h3>{text.SUPERFLUID_DELEGATION}</h3>
          <p className="superFluid-amount"><span>{amount}</span> OSMO</p>
      </div>
    </Div>
  );
};

const mapStateToProps = (state) => ({
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { })(
    SuperFluidBlock
);
