import { Group,Div } from "@vkontakte/vkui";
import { useMemo } from 'react';
import "../styles/panels/pool-details.css";
import ROUTES from "../../routes";
import {
  setActivePage,
  setPreviosPanel,
} from "../../store/actions/panelActions";
import { connect } from "react-redux";
import { setPoolMethod, setSelectedNode, setIsSuperfluidLock } from "../../store/actions/poolActions";
import UnbondingItem from "../uikit/UnbondingItem";
import BigNumber from "bignumber.js";
import { numberWithCommas } from "../helpers/numberFormatter";
import PoolInfoTable from "../uikit/PoolInfoTable";
import text from "../../text.json";
import UnbondingsTable from "../uikit/UnbondingTable";
import SuperFluidBlock from '../uikit/SuperfluidBlock';
import { CoinPretty, Dec } from '@keplr-wallet/unit';
import {getGammInfo} from '../../networking/osmosisMethods/poolMethods'
const PoolDetails = (props) => {
  const { pool,superfluidDelegations,stakeNodes } = props.poolReducer;
  const setMethod = (method, route) => {
    props.setPoolMethod(method);
    props.setActivePage(route);
    props.setSelectedNode(null);
    props.setPreviosPanel(ROUTES.POOL_DETAILS);
    props.setIsSuperfluidLock(showSuperfluidDelegations)
  };
  const superfluidDelegatedValidators = stakeNodes?.filter(activeValidator =>
		superfluidDelegations?.superfluid_delegation_records?.some(delegation => delegation.validator_address === activeValidator.address && delegation.delegation_amount.denom == 'gamm/pool/'+pool.id)
	);
  const showSuperfluidDelegations = pool.isSuperfluidPool && superfluidDelegatedValidators && superfluidDelegatedValidators.length > 0 ? true : false;
  const poolShareCurrency = getGammInfo(pool.id)
  const showSelectValidator = pool.lockDurations.find(item => item.duration == 14).lockup?.lockIds.length > 0
  const totalDelegations = useMemo(() => {
		let r = new CoinPretty(poolShareCurrency, new Dec(0));
		if (showSuperfluidDelegations) {
			for (const del of superfluidDelegations.total_delegated_coins.filter(delegation => delegation.denom == 'gamm/pool/'+pool.id)) {
				r = r.add(new Dec(del.amount));
			}
		}
		return r;
	}, [poolShareCurrency, superfluidDelegations]);
  return (
    <Group className="pool-details-block">
      <div className="pool-details-row">
        <h4>Poll Liquidity</h4>
        <p className="pool-purple-text">
          {pool.poolTVL?.toString().replace("$", "")} <span> $</span>
        </p>
      </div>
      <div className="pool-details-row">
        <h4>Swap fee</h4>
        <p className="pool-blue-text">
          {BigNumber(+pool.poolParams?.swapFee * 100).toFixed(1)}{" "}
          <span> % </span>
        </p>
      </div>
      <div className="pool-details-row">
        <h4>Pool catalyst</h4>
        <p className="pool-blue-text">
          {pool.poolAssets.map((item, i) =>
            i == pool.poolAssets.length - 1 ? (
              <span className="pool-blue-text" key={i}>
                {parseInt((+item.weight * 100) / +pool.totalWeight)}{" "}
                <span> % {pool.poolInfo[i]?.symbol} </span>{" "}
              </span>
            ) : (
              <span className="pool-blue-text" key={i}>
                {parseInt((+item.weight * 100) / +pool.totalWeight)}{" "}
                <span> % {pool.poolInfo[i]?.symbol} /</span>{" "}
              </span>
            )
          )}
        </p>
      </div>
      <div className="pool-details-row">
        <h4>{text.MY_LIQUIDITY}</h4>
        <p className="pool-green-text">
          {pool.myLiquidity.toString().replace("$", "") || 0}
          <span> $</span>
        </p>
      </div>
      <div className="pool-details-row pool-right">
        <p className="pool-text-small">
          {pool.myAmounts &&
            pool.myAmounts.map((item, i) =>
              i == pool.myAmounts.length - 1 ? (
                <span className="pool-green-text" key={i}>
                  {numberWithCommas(item)}{" "}
                  <span> {pool.poolInfo[i]?.symbol} </span>{" "}
                </span>
              ) : (
                <span className="pool-green-text" key={i}>
                  {numberWithCommas(item)}{" "}
                  <span> {pool.poolInfo[i]?.symbol} /</span>{" "}
                </span>
              )
            )}
        </p>
      </div>
      <div className="pool-details-row pool-buttons">
        <button onClick={() => setMethod("add", ROUTES.CONTROL_PANEL)}>
          {text.ADD_LIQUIDITY}
        </button>
        <button
          id="remove-btn"
          onClick={() => setMethod("remove", ROUTES.CONTROL_PANEL)}
        >
          {text.REMOVE_LIQUIDITY}
        </button>
      </div>

      {pool.isIncentivized ? (
        <div>
          <div className="row">
            {pool.lockDurations?.map((item) => (
              <UnbondingItem item={item} superfluid={pool.isSuperfluidPool} key={item?.duration} />
            ))}
          </div>
         {showSuperfluidDelegations && superfluidDelegatedValidators.map((node,i) => (
         <SuperFluidBlock node={node} showSuperfluidDelegations={showSuperfluidDelegations} key={i} totalDelegations={totalDelegations}/> )) }
         {!showSuperfluidDelegations && pool.isSuperfluidPool && showSelectValidator &&
          <Div className="superFluid-block" onClick={() => {
            props.setActivePage(ROUTES.SELECT_NODE);props.setPreviosPanel(ROUTES.POOL_DETAILS);
          }}>
          <div className="superFluid-column">
                <h3>{text.SUPERFLUID_VALIDATOR}</h3>
                <p className="no-validator-text">no validator</p>
            </div>
            <div className="superFluid-column">
              <img src='img/icons/big-arrow.svg' className="big-arrow" alt='arrow' />
            </div>
        </Div>}
          <div className="row">
            <h3 className="bold-text">{text.AVAILABLE_TOKENS}</h3>
            <h3 className="bold-text">
              {pool.availableLP.toString().replace("$", "")} <span> $</span>
            </h3>
          </div>
          <div className="pool-details-row">
            <button onClick={() => setMethod("bond", ROUTES.CONTROL_BOND)}>
              Bond
            </button>
            <button
              id="remove-btn"
              onClick={() => setMethod("unbond", ROUTES.CONTROL_BOND)}
            >
              Unbond
            </button>
          </div>     
          <PoolInfoTable pool={pool} />
          {pool.unlockingDatas?.length > 0 && (
            <h3 className="bold-text">{text.UNBONDINS}</h3>
          )}
          {pool.unlockingDatas?.length > 0 && <UnbondingsTable pool={pool} />}
        </div>
      ) : (
        ""
      )}
    </Group>
  );
};
const mapStateToProps = (state) => ({
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, {
  setPreviosPanel,
  setActivePage,
  setSelectedNode,
  setPoolMethod,
  setIsSuperfluidLock
})(PoolDetails);
