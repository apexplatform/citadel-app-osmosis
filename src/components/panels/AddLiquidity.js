import {
  Group,
  FormItem,
  Div,
  Checkbox,
  CustomSelect,
  CustomSelectOption,
  Avatar,
} from "@vkontakte/vkui";
import PoolAmountInput from "../uikit/PoolAmountInput";
import { connect } from "react-redux";
import { numberWithCommas } from "../helpers/numberFormatter";
import { CoinPretty, Dec, IntPretty } from "@keplr-wallet/unit";
import { useState } from "react";
import { getMaxBalance } from "../../networking/osmosisMethods/poolMethods";
import { prepareJoinPoolTransaction } from "../../store/actions/poolActions";
import { setAmount } from "../../store/actions/walletActions";
import text from "../../text.json";
const AddLiquidity = (props) => {
  const [error, setError] = useState(false);
  const [errorZero, setErrorZero] = useState(true);
  const { pool, tokenBalances } = props.poolReducer;
  const [usdPrice, setUsdPrice] = useState(0);
  const { currentWallet, tokenList } = props.walletReducer;
  let initialAmounts = [];
  pool.poolAssets.map((item, index) => {
    initialAmounts.push({
      amount: 0,
      denom: item.token.denom,
      decimals: pool.poolCoinInfo[index].coinDecimals,
    });
  });
  const prettyBalanceList = [];
  tokenBalances.map((item) => {
    pool.poolAssets.map((pool) => {
      if (item.denom === pool.token.denom) {
        prettyBalanceList.push(item);
      }
    });
  });
  const [shareOutAmount, setShareOutAmount] = useState(null);
  const [amounts, setAmount] = useState(initialAmounts);
  const [singleLp, setSingleLp] = useState(false);
  const [index, setIndex] = useState(0);
  const tokenOptions = [];
  pool.poolCoinInfo.map((item, index) => {
    tokenOptions.push({
      label: item.coinDenom || pool.poolInfo[index]?.symbol,
      value: index,
      logo: item.coinImageUrl,
    });
  });
  const updateAmount = (index, amount, isSingle = false, isMax = false) => {
    amount = amount.toString().replace(",", "");
    props.setAmount(amount);
    let temp = amounts;
    let price = 0;
    let poolInfo = pool.poolInfo;
    if (poolInfo) {
      price =
        (poolInfo[index == 0 ? 1 : 0].price *
          poolInfo[index == 0 ? 1 : 0]?.amount) /
        poolInfo[index]?.amount;
    }
    temp[index].amount = amount;
    setError(false);
    setErrorZero(false);
    if (amount.length) {
      if (isSingle) {
        temp[index].amount =
          amount == "max"
            ? getMaxBalance(index, pool, prettyBalanceList, amounts)
            : amount;
        temp[index].amount = temp[index].amount.toString().replace(",", "");
        setUsdPrice(price * +temp[index].amount);
        setAmount(temp);
        const balance = getMaxBalance(index, pool, prettyBalanceList, amounts);
        setError(+balance < +amount);
      } else {
        setUsdPrice(price * +amount);
        const tokenInAmount = new IntPretty(new Dec(amount));
        const totalShare = new IntPretty(
          pool.totalShares.amount
        ).moveDecimalPointLeft(18);
        const currentPoolDenom = amounts[index].denom;
        const currentAsset = pool.poolAssets.find(
          (asset) => asset.token.denom === currentPoolDenom
        );
        if (!currentAsset) {
          return;
        }
        const currentAssetAmount = new IntPretty(
          currentAsset.token.amount
        ).moveDecimalPointLeft(pool.poolCoinInfo[index].coinDecimals);
        const shareOutAmount = tokenInAmount
          .mul(totalShare)
          .quo(currentAssetAmount);
        setShareOutAmount(shareOutAmount);
        const otherConfigs = amounts.slice();
        otherConfigs.splice(index, 1);
        const otherCoinInfo = pool.poolCoinInfo.slice();
        otherCoinInfo.splice(index, 1);

        for (const otherConfig of otherConfigs) {
          const otherPoolAsset = pool.poolAssets.find(
            (asset) => asset.token.denom === otherConfig.denom
          );
          if (!otherPoolAsset) {
            return;
          }
          const otherAssetAmount = new IntPretty(
            new Dec(otherPoolAsset.token.amount)
          ).moveDecimalPointLeft(otherCoinInfo[0].coinDecimals);
          temp.map((item, i) => {
            if (item.denom === otherConfig.denom) {
              temp[i].amount = shareOutAmount
                .mul(otherAssetAmount)
                .quo(totalShare)
                .trim(true)
                .shrink(true)
                .maxDecimals(isMax ? 6 : 4)
                .locale(false)
                .toString();
              tokenList.map((token) => {
                if (otherConfig.denom == token.denom) {
                  if (+temp[i].amount > +token.balance) {
                    setError(true);
                  }
                }
              });
            }
          });
        }
        let balanceAmount = 0;
        tokenBalances.map((item) => {
          if (item.denom == amounts[index].denom) {
            balanceAmount = item.amount;
          }
        });
        let balance = new CoinPretty(
          { coinDecimals: 6 },
          new Dec(balanceAmount)
        );
        balance._options.hideDenom = true;
        balance = balance.toString();
        if (!error) {
          if (
            prettyBalanceList.length < pool.poolAssets.length ||
            +balance < +amount
          ) {
            setError(true);
          }
        }
        setAmount(temp);
      }
    }
    if (+amount == 0) {
      setErrorZero(true);
    }
    if (+amount == 0 && isMax) {
      setError(true);
    }
  };

  const prepareJoinPool = () => {
    if (!error && !errorZero) {
      if (singleLp) {
        props.prepareJoinPoolTransaction(
          amounts[index],
          shareOutAmount,
          singleLp
        );
      } else {
        props.prepareJoinPoolTransaction(amounts, shareOutAmount, singleLp);
      }
    }
  };
  const setIndexAndPrice = (val) => {
    setIndex(+val);
    let price = 0;
    let poolInfo = pool.poolInfo;
    if (poolInfo) {
      price =
        (poolInfo[+val == 0 ? 1 : 0].price *
          poolInfo[+val == 0 ? 1 : 0]?.amount) /
        poolInfo[+val]?.amount;
    }
    setUsdPrice(price * +amounts[index].amount);
  };
  return (
    <Group>
      {!singleLp &&
        amounts.map((token, index) => (
          <FormItem
            className="bond-control"
            key={index}
            top={pool.poolInfo[index]?.symbol + " amount"}
          >
            <PoolAmountInput
              isSingle={false}
              prettyBalanceList={prettyBalanceList}
              setAmount={updateAmount}
              amount={amounts}
              symbol={pool.poolInfo[index]?.symbol}
              index={index}
              hideFee={pool.poolInfo[index]?.symbol != currentWallet.code}
            />
          </FormItem>
        ))}
      {singleLp && (
        <div className="swap-column">
          <FormItem top="From token" className="formTokenItem">
            <div className="swap-row token-liquidity-row">
              <Avatar
                size={24}
                className="token-logo"
                src={tokenOptions[index].logo}
              />
              <CustomSelect
                className="select-block"
                options={tokenOptions}
                defaultValue={index}
                onChange={(e) => setIndexAndPrice(e.target.value)}
                renderOption={({ option, ...restProps }) => (
                  <CustomSelectOption
                    {...restProps}
                    key={option.value}
                    before={<Avatar size={24} src={option.logo} />}
                  />
                )}
              />
              <PoolAmountInput
                isSingle={true}
                className="amount-block"
                prettyBalanceList={prettyBalanceList}
                setAmount={updateAmount}
                amount={amounts}
                symbol={pool.poolInfo[index]?.symbol}
                index={index}
                hideFee={true}
              />
            </div>
            <div className="usd-container">
              <span>$</span>
              <b>{numberWithCommas(usdPrice, 2)}</b>
            </div>
          </FormItem>
        </div>
      )}
      <Checkbox
        onClick={(e) => {
          setSingleLp(e.target.checked);
        }}
      >
        {text.SINGLE_ASSET}
      </Checkbox>
      <Div
        className="control-btn"
        id={error || errorZero ? "disabled-btn" : undefined}
        onClick={() => prepareJoinPool()}
      >
        {error ? (
          <span>{text.ERRORS.INSUFFICIENT_FUNDS}</span>
        ) : errorZero ? (
          <span>{text.EMPTY_BALANCE}</span>
        ) : (
          <span>{text.ADD_LIQUIDITY}</span>
        )}
      </Div>
    </Group>
  );
};
const mapStateToProps = (state) => ({
  poolReducer: state.poolReducer,
  swapReducer: state.swapReducer,
  walletReducer: state.walletReducer,
});

export default connect(mapStateToProps, {
  prepareJoinPoolTransaction,
  setAmount,
})(AddLiquidity);
