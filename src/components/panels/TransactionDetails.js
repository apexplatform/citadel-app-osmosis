import ROUTES from "../../routes";
import { useEffect } from 'react'
import { useSelector } from "react-redux";
import { Header, Content, Icon, InfoCardBlock, InfoCardItem } from "@citadeldao/apps-ui-kit/dist/main";
import text from "../../text.json";
import { Config } from '../config/config';
import moment from "moment";
import '../styles/panels/transactions.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { formatNumber } from '../helpers/numberFormatter';
import { formatAddress } from '../helpers/addressFormatter';
import { panelActions } from '../../store/actions';

const TransactionDetails = () => {
  const config = new Config()
  const location = useLocation()
  const { activeWallet } = useSelector(state => state.wallet)
  const data = useSelector(state => state.transaction.openedTransaction)
  const navigate = useNavigate()
  const back = () => navigate(ROUTES.TRANSACTIONS)
  useEffect(()=>{
    panelActions.setCurrentPanel(location.pathname)
    // eslint-disable-next-line
  },[])

  return (
    <div className="panel">
      <Content>
        <Header config={config} border style={{margin: "8px 0 24px 0"}} title={text.TRANSACTIONS_DETAILS} onClick={() => back()} back={true} />
        <InfoCardBlock className='transactions-details-block'>
          <InfoCardItem text='Amount'>
            <span className="transactions-amount">
              {formatNumber(data.amount?.text)}
              <span className="transaction-ticker">{data.amount?.symbol}</span>
            </span>
          </InfoCardItem>
          <InfoCardItem text='Fee'>
            <span className="transactions-details-fee">
              {data.fee?.text}
              <span className="transaction-ticker">
                {data.fee?.symbol}
              </span>
            </span>
          </InfoCardItem>
        <InfoCardItem text='Status'>
            <span
              className={
                !data.error
                  ? "transactions-status"
                  : "transactions-status-failed"
              }
            >
              {!data?.error ? 'Success' : 'Failed'}
            </span>
          </InfoCardItem>
          <InfoCardItem text='Data & time'>
            <p className="transaction-datetime">{moment(data.date).from(new Date())}</p>
          </InfoCardItem>

          {data?.meta_info && data?.meta_info?.map((item, i) => 
            {return item?.title !== 'Amount' && item.value ? <InfoCardItem text={item?.title} key={i}>
              <div className="row">
                {item.type === 'text' && <span>{item?.value?.text || item?.value} </span> }
                {item.type === 'amount_collection' && item.value.map((token,i) => (
                  <span className="transactions-amount">
                     { formatNumber(token?.text)}
                    <span className="transaction-ticker">{formatAddress(token?.symbol)}
                    {i !== item.value.length - 1 && ' / ' } 
                    </span>
                  </span>
                ))}
                {item.type === 'amount' &&  
                <span className="transactions-amount">
                  {formatNumber(item.value?.text)}
                  <span className="transaction-ticker">{item.value?.symbol}</span>
                </span>}
                {item.type === 'text_collection' &&  
                 <div className="row"> 
                  {item.value?.map((elem,i) => (
                    <span className="row"> {elem} {i !== item.value.length - 1 && <Icon name={'angle-right-thin'} color='#8ca2bb' width='14px'/>} </span>
                  ))}   
                  </div>}  
                {item?.value?.url && (
                  <a
                    href={item?.value?.url}
                    target="_blank"
                    className="transactions-link"
                    rel="noreferrer"
                  >
                    <span className="web-link">{item?.value?.text}</span>
                    <span className="mobile-link">{formatAddress(item?.value?.text)}</span>
                  </a>
                )}
              </div>
            </InfoCardItem> : ''
          })}
          <InfoCardItem text={text.VIEW_TRANSACTION}>
            <a href={activeWallet.getTxUrl(data?.hash)} className='transaction-link' target='_blank' rel="noreferrer"> <Icon name='arrow-from-square-up-right' color='#0091A6' width='16px'/></a>
          </InfoCardItem>
        </InfoCardBlock>
      </Content>
    </div>
  );
};

export default TransactionDetails