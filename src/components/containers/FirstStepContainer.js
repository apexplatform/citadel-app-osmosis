import React, { useEffect, useState } from 'react';
import { ClearSelectInput, Icon, BlockButton, BigButtons} from '@citadeldao/apps-ui-kit/dist/main';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import ROUTES from '../../routes'
import { useLocation } from 'react-router-dom';
import { poolActions, panelActions, swapActions } from '../../store/actions';
const FirstStepContainer = (props) => {
    const { tokens } = useSelector((state) => state.wallet)
    const { selectedTokens } = useSelector((state) => state.pool)
    const [tokensList, setTokens] = useState(selectedTokens || []);
    const navigate = useNavigate()
    const location = useLocation()
    const dispatch = useDispatch()
    const [percentError, setPercentError] = useState(true);
    const removeToken = (index) => {
        setTokens(tokensList.filter((elem, i) => i !== index));
        checkPercent()
    };
    useEffect(() => {
        checkPercent()
        // eslint-disable-next-line
    },[selectedTokens])
    const checkPercent = () => {
        let sum = 0;
        tokensList.forEach((elem) => {
            sum += +elem.percent;
        });
        setPercentError(sum < 100 || sum > 100);
    }

    const setSelectedOption = (code) => {
        panelActions.setPreviousPanel(location.pathname)
        dispatch(swapActions.setSelectedToken(code))
        navigate(ROUTES.SELECT_TOKEN)
    }
    const nextStep = () => {
        if (tokensList.length >= 2 && !percentError) {
          poolActions.setSelectedTokens(tokensList);
          props.setActiveOption(2);
        }
    };
    const addTokens = () => {
        setPercentError(true);
        const item = tokens?.filter(
          ({ code: code1 }) => !tokensList.some(({ code: code2 }) => code2 === code1)
        );
        let arr = [
            ...tokensList,
            { percent: 0, amount: 0, token: item[0], code: item[0]?.code, name: item[0].name, logoURI: item[0].logoURI, },
          ]
        setTokens(arr);
        checkPercent()
        poolActions.setSelectedTokens(arr);
      };
    const setPercent = (percent, code) => {
        const temp = tokensList.map((elem) => {
            if (elem.token.code === code) {
                elem.percent = percent;
            }
            return elem;
        });
        setTokens(temp);
        checkPercent();
    };
    return(
        <div>
            {tokensList?.map((elem,i) =>(
                <div className='base-input' key={i}>
                    <ClearSelectInput 
                        label={'Pool shares #' + (i+1)}
                        value={elem.percent}
                        setValue={setPercent} 
                        token={elem}
                        index={i}
                        onClick={() => setSelectedOption(elem.code)}
                        removeElem={removeToken}
                    />
                </div>
            ))}
            <BlockButton onClick={() => addTokens()} text='Add new token' iconColor='#6B93C0' textColor='#6B93C0' bgColor='#F4F6FF' bgColorBtn='#F4F6FF' name='plus' iconHoverColor='#FFFFFF' iconHoverBgColor='#5639E0'/>
            {tokensList.length < 2 &&<div className='row' id='amount-error'>
                <Icon name='alarm-octagon' color='#EA2929' size = 'small' />
                <p>Minimum of 2 assets required</p>
            </div>}
            <div className='center'>
                <BigButtons onClick={() => nextStep()} style={{marginTop: '16px'}} disabled={tokensList.length >= 2 && !percentError ? false : true} text='Next' textColor='#FFFFFF' bgColor='#0095D6'  hidename={true}/>
            </div>
        </div>
    )
}

export default FirstStepContainer;