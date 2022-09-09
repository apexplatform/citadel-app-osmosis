import { useState } from "react";
import { useSelector } from 'react-redux';
import { SelectToken, Icon, SmallCheckbox, Button, AmountInput } from '@citadeldao/apps-ui-kit/dist/main';
import { poolActions } from '../../store/actions';
import text from "../../text.json";
import { prettyNumber } from "../helpers/numberFormatter";
import BigNumber from "bignumber.js";
const ThirdStepContainer = (props) => {
    const { selectedTokens } = useSelector((state) => state.pool)
    const [error, setError] = useState(false);
    const [fee, setFee] = useState(0);
    const { activeWallet } = useSelector((state) => state.wallet)
    const [isChecked, setIsChecked] = useState(false);
    const [tokens, setTokens] = useState(selectedTokens);
    const createPool = () => {
        if (isChecked && activeWallet.balance?.mainBalance > 100) {
            poolActions.prepareCreatePool(fee);
        }
    };
    const setAmount = (val,code) => {
        setError(false);
        let temp = tokens.map((item) => {
          if (item.token.code === code) {
            if (+val > item.token.balance && code !== "OSMO") {
              setError(text.ERRORS.INSUFFICIENT_FUNDS);
              item.amount = +val;
            } else if (code === "OSMO" && item.token.balance < 100) {
              item.amount = +val;
              setError(text.ERRORS.INSUFFICIENT_FUNDS);
            } else {
              item.amount = +val;
              setError(false);
            }
          }
          return item;
        });
        temp.forEach((elem) => {
          if (elem.amount === 0) {
            setError(text.EMPTY_BALANCE);
          }
          if (elem.amount < 0) {
            setError(text.ERRORS.INSUFFICIENT_FUNDS);
          }
        });
        setTokens(temp);
      };
    const setMaxValue = (code) => {
        let currentToken = tokens.find(elem => elem.code === code)
        setAmount(currentToken.token.balance, code)
    }
    const checkError = () => {
        setIsChecked(!isChecked)
        if(activeWallet.balance < 100) {
            setError(text.ERRORS.INSUFFICIENT_FUNDS);
        }
    }
    const checkFee = (val) => {
        // eslint-disable-next-line 
        val = val.replace(/[^0-9\.]/g, "");
        if(val.split(".").length - 1 !== 1 && val[val.length-1] === '.') return
        if (
          val.length === 2 &&
          val[1] !== "." &&
          val[1] === "0"
        ) {
            setFee(val)
        } else if (val[0] === "0" && val[1] !== ".") {
            setFee(BigNumber(val).toFixed());
        } else {
            setFee(val);
        }
      };
    return(
        <div className="steps-container">
            {
                tokens.map((item,i) => (
                    <SelectToken     
                    max={true} 
                    key={i}
                    procent={item.percent}
                    balance={true} 
                    token={true} 
                    action={false}
                    name={item.code}
                    style={{marginBottom: '10px'}}
                    data={item.token} 
                    value={item.amount} 
                    checkAmount={setAmount} 
                    onMaxClick={() => setMaxValue(item.code)}
                    selectedOption={{...item.token, balance: prettyNumber(item.token.balance, 6)}}
                    field='to'
                    />
                ))
            }
            <AmountInput inputTitle='Swap fee' data={{network: '%'}} value={fee} checkAmount={checkFee}/>
            <SmallCheckbox text="I understand  that creating a new pool will cost 100 OSMO" textColor='#3C5B7E' isChecked={isChecked} disabled={false} onClick={() => checkError()}/>
            {error &&
            <div className='row' id='amount-error'>
                <div className='amount-error__circle'>
                  <Icon name='alarm-octagon' color='#EA2929' width='16px'/>
                </div>
                <p>{error}</p>
            </div>}
            <div className='center'>
                <Button onClick={() => createPool()} hoverBgColor='#5639E0' style={{marginTop: '16px'}} disabled={isChecked && activeWallet.balance?.mainBalance > 100 ? false : true} textColor='#FFFFFF' bgColor='#0095D6'>Create pool</Button>
            </div>
        </div>
    )
}

export default ThirdStepContainer;