import { useEffect, useState } from 'react';
import ROUTES from "../../routes";
import { useSelector } from "react-redux";
import { Header, Content, Icon, InfoCardBlock, InfoCardItem } from "@citadeldao/apps-ui-kit/dist/main";
import text from "../../text.json";
import { Config } from '../config/config';
import moment from "moment";
import BigNumber from "bignumber.js";
import '../styles/panels/transactions.css';
import { useNavigate } from 'react-router-dom';
import { formatAddress } from '../helpers/addressFormatter'
import { prettyNumber } from '../helpers/numberFormatter';
const TransactionDetails = (props) => {
  const config = new Config()
  const { activeWallet } = useSelector(state => state.wallet)
  const data = useSelector(state => state.transaction.openedTransaction)
  const navigate = useNavigate()
  const back = () => navigate(ROUTES.TRANSACTIONS)
  const [windowDimensions, setWindowDimensions] = useState(window.innerWidth);
  useEffect(() => { 
    function handleResize() {
        const { innerWidth: width } = window;
        setWindowDimensions(width);
    }
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize) };
        // eslint-disable-next-line 
    },[])
  return (
    <div className="panel">  
      <Content>
        <Header config={config} style={{margin: "8px 0 24px 0"}} border title={text.TRANSACTIONS_DETAILS} onClick={() => back()} back={true} />
        <InfoCardBlock className='transactions-details-block'>
          {data.to?.value && 
          <InfoCardItem text='Address'>
            <span className="transaction-address">{windowDimensions < 600 ? formatAddress(data.to?.value): data?.to?.value }</span>
          </InfoCardItem> }
          <InfoCardItem text='Amount'>
            <span className="transactions-amount">
              {prettyNumber(BigNumber(data.amount?.value?.amount).toFixed(),6)}{" "}
              <span className="transaction-ticker">{data.amount?.value?.ticker}</span>
            </span>
          </InfoCardItem>
          <InfoCardItem text='Fee'>
            <span className="transactions-details-fee">
              {data.fee?.value?.amount || 0}{" "}
              <span className="transaction-ticker">
                {data.fee?.value?.ticker || activeWallet.symbol}
              </span>
            </span>
          </InfoCardItem>
        <InfoCardItem text='Status'>
            <span
              className={
                data.status?.value === "Success"
                  ? "transactions-status"
                  : "transactions-status-failed"
              }
            >
              {data.status?.value}
            </span>
          </InfoCardItem>
          <InfoCardItem text='Data & time'>
            <p className="transaction-datetime">{moment(data.date.value).from(new Date())}</p>
          </InfoCardItem>

          {data?.meta_info?.length && data?.meta_info?.map((item, i) => (
            <InfoCardItem text={item?.title} key={i}>
              <div className="row">
                <span>{item?.value?.text || item?.value} </span>
                {item?.value?.url ? (
                  <a
                    href={item?.value?.url}
                    target="_blank"
                    style={{ cursor: "pointer" }}
                    rel="noreferrer"
                  >
                    <Icon name='arrow-from-square-to-square' />
                  </a>
                ) : (
                  ""
                )}
              </div>
            </InfoCardItem>
          ))}
          <InfoCardItem text={text.VIEW_TRANSACTION}>
            <a href={activeWallet.getTxUrl(data?.hash?.value)} className='transaction-link' target='_blank' rel="noreferrer"><Icon name='link' /></a>
          </InfoCardItem>
        </InfoCardBlock>
      </Content>
    </div>
  );
};

export default TransactionDetails