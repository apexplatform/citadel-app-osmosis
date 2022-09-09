import { useState } from "react";
import { useSelector } from 'react-redux';
import { SelectToken, Icon, Button} from '@citadeldao/apps-ui-kit/dist/main';
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
                    <SelectToken     
                    max={true} 
                    key={i}
                    procent={item.percent}
                    balance={true} 
                    token={true} 
                    action={false}
                    name={item.code}
                    style={{marginBottom: '10px'}}
                    data={{...item.token, balance: prettyNumber(item.token.balance, 6)}} 
                    value={item.amount} 
                    checkAmount={setAmount} 
                    onMaxClick={() => setMaxValue(item.code)}
                    selectedOption={{...item.token, balance: prettyNumber(item.token.balance, 6)}}
                    field='to'
                    />
                ))
            }
            {error &&<div className='row' id='amount-error'>
                <Icon name='alarm-octagon' color='#EA2929' width='16px' />
                <p>{error}</p>
            </div>}
            <div className='center'>
                <Button onClick={() => nextStep()} hoverBgColor='#5639E0' style={{marginTop: '16px'}} disabled={!error ? false : true} textColor='#FFFFFF' bgColor='#0095D6'>Next</Button>
            </div>
        </div>
    )
}

export default SecondStepContainer;