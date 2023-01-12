import { useState } from "react";
import { useSelector } from 'react-redux';
import { InputSelect, Icon, Checkbox, Button, Input, FormGroupBalance } from '@citadeldao/apps-ui-kit/dist/main';
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
                <div style={{marginBottom: '16px'}} key={i}>
                <InputSelect
                  input={{
                    label: "Amount",
                    currency: item.code,
                    value: item.amount,
                    onChange: (value) => setAmount(value),
                    action: { text: 'MAX', onClick: () => setMaxValue(item?.code) }
                  }}
                  select={{
                      value: item?.code,
                      options: [{...item, icon: item.logoURI, value: item.code, label: item.code + " (" + item.percent + "%)"}],
                      label: 'Pool shares #' + (i+1),
                  }}
                  currencyKey = 'code'
                />
                <FormGroupBalance 
                  placement="end" 
                  balance={prettyNumber(item?.token?.balance)+''} 
                  text="Balance" 
                  currency={item?.code}
                />
              </div>
              ))
            }
            <Input  
              type="amount"
              currency="%"
              label='Swap fee' 
              value={fee} 
              onChange={checkFee}
            />
            <br/>
            <Checkbox  
              value={isChecked} 
              onChange={() => checkError()} 
            >I understand  that creating a new pool will cost 100 OSMO</Checkbox>
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