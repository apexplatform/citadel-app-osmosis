import "../styles/components/poolItem.css";
import text from "../../text.json";
import BigNumber from "bignumber.js";
import { fotmatAddress } from "../helpers/addressFormatter";
import { prettyNumber, formatByDecimals } from "../helpers/numberFormatter";
const PoolItem = (props) => {
  const { item } = props;
  return (
    <div className="pool-item">
      <div className="pool-row pool-separator">
        <div className="pool-row">
          <div className="pool-img">
            <img
              src="img/tokens/osmosis.svg"
              alt="coin"
            />
          </div>
          <div className="pool-column">
            <div className="pool-row">
              <h3>Pool</h3>
              <p className="pool-number"> #{item.id}</p>
              <h3>
                {" "}
                {item.poolInfo[0]?.symbol ||
                  fotmatAddress(item.poolInfo[0]?.denom)}
                /
                {item.poolInfo[1]?.symbol ||
                  fotmatAddress(item.poolInfo[1]?.denom)}
              </h3>
            </div>
          </div>
        </div>
        {item.apy && (
          <div className="pool-apr-div">
            <p className="pool-grey-text">APR: </p>
            <p className="pool-apr-amount">
              {" "}
              {item.apy} <span className="pool-grey-text">%</span>
            </p>
            <img
              src="img/tokens/osmosis.svg"
              alt="coin"
            />
            {item.isSuperfluidPool && item.superFluidAPY &&
            <div className="apr-row">
             <img
              src="img/icons/+.svg"
              alt="plus"
              className="plus-icon"
            />
            <p className="pool-apr-amount">
              {formatByDecimals(item.superFluidAPY,0)} <span className="pool-grey-text">%</span>
            </p>
            <img
              src="img/icons/osmo.svg"
              alt="plus"
            />
            </div>}
          </div>
        )}
      </div>
      <div>
        <div className="pool-row">
          <p className="pool-grey-text">{text.PROVIDER_FEE_TEXT}: </p>
          <p className="pool-amount-violet">
            {" "}
            {BigNumber(+item.poolParams?.swapFee * 100).toFixed(1)}{" "}
            <span className="pool-grey-text">%</span>
          </p>
        </div>
        <div className="pool-row">
          <p className="pool-grey-text">{text.POOL_LIQUIDITY}:</p>
          <p className="pool-amount-violet">
            {prettyNumber(item.poolInfo[0]?.liquidity, 6)}{" "}
            <span className="pool-grey-text">$</span>
          </p>
        </div>
        {item.myLiquidity ? (
          <div className="pool-row">
            <p className="pool-grey-text">{text.MY_LIQUIDITY}:</p>
            <p className="pool-amount">
              {item.myLiquidity.replace("$", "")}
              <span className="pool-grey-text"> $</span>
            </p>
          </div>
        ) : (
          ""
        )}
      </div>
    </div>
  );
};

export default PoolItem;
