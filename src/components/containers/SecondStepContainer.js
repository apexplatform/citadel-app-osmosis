import { useState } from "react";
import { useSelector } from 'react-redux';
import { InputSelect, Icon, Button, FormGroupBalance} from '@citadeldao/apps-ui-kit/dist/main';
import { poolActions } from '../../store/actions';
import text from "../../text.json";
import { prettyNumber } from "../helpers/numberFormatter";
const SecondStepContainer = (props) => {
    const { selectedTokens } = useSelector((state) => state.pool)
    const [error, setError] = useState(false);
    const [tokens, setTokens] = useState(selectedTokens);
    const nextStep = () => {
        if (!error) {
          poolActions.setSelectedTokens(tokens);
          props.setActiveOption(3);
        }
    };
    const setAmount = (val,code) => {
        setError(false);
        let temp = tokens.map((item) => {
          if (item.token.code === code) {
            if (+val > item.token.balance && code !== "OSMO") {
              setError(text.ERRORS.INSUFFICIENT_FUNDS);
              item.amount = +val;
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
    return(
        <div>
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
            {error &&
            <div className='row' id='amount-error'>
                <div className='amount-error__circle'>
                  <Icon name='alarm-octagon' color='#EA2929' width='16px'/>
                </div>
                <p>{error}</p>
            </div>}
            <div className='center'>
                <Button onClick={() => nextStep()} hoverBgColor='#5639E0' style={{marginTop: '16px'}} disabled={!error ? false : true} textColor='#FFFFFF' bgColor='#0095D6'>Next</Button>
            </div>
        </div>
    )
}

export default SecondStepContainer;