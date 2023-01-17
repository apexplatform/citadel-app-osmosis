import React, { useEffect, useState } from 'react'
import { Loader, Content, Tabbar, Pagination, TransactionCard } from "@citadeldao/apps-ui-kit/dist/main"
import text from "../../text.json"
import { transactionActions, panelActions } from '../../store/actions';
import {useDispatch,useSelector} from "react-redux";
import {useNavigate} from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import ROUTES from "../../routes";
import { Config } from '../config/config';

const TransactionsPanel = () => {
    const navigate = useNavigate()
    const location = useLocation()
    const config = new Config()
    const dispatch = useDispatch();
    const { activeWallet } = useSelector((state) => state.wallet)
    const { transactions } = useSelector((state) => state.transaction)
    const [page, setPage] = useState(1)
    const loader = useSelector((state) => state.transaction.transactionsLoaded)
    const { bottomInset, currentPanel } = useSelector(state => state.panels)
    useEffect(()=>{
        if(currentPanel !== ROUTES.TRANSACTION_DETAILS){
            dispatch(transactionActions.loadTransactions(page))
        }
        panelActions.setCurrentPanel(location.pathname)
        panelActions.setPreviousPanel(location.pathname)
        // eslint-disable-next-line
    },[activeWallet])

    const setOpenedTransaction = (data) => {
        transactionActions.setOpenedTransaction(data)
        navigate(ROUTES.TRANSACTION_DETAILS)
    }

    function getAmount(items){
        let amount = {text: 0, symbol: activeWallet?.code}
        if(items.length){
            let transaction = items.find(elem => elem.type !== 'Meta Info')
            if(transaction){
                amount = transaction.components?.find(elem => elem.type === 'amount')?.value || amount
            }else{
                let meta_info = items.find(elem => elem.type === 'Meta Info')
                if(meta_info){
                    let values = []
                    meta_info?.components?.forEach(elem => {
                        if(elem.type === 'amount'){
                            values.push(elem.value)
                        }
                    })
                    if(values.length > 0){
                        amount = values[0]
                    }
                }     
            }
        }
        return amount
    }

    function loadTransactionsByPage(page){
        dispatch(transactionActions.loadTransactions(page))
        setPage(page)
    }

    return (
        <div className='panel'>
            <Content> 
                  { (loader && transactions?.list?.length > 0) && transactions?.list?.map((item,i) => {
                    let amount = getAmount(item?.view)
                    let meta_info = item?.view[0].components
                    return <TransactionCard 
                        title = { item?.view[0]?.type }
                        icon = { item.view[0]?.icon }
                        date = { item?.date}
                        fee = { item?.fee }
                        amount = { amount }
                        status = { item?.error }
                        key={i}
                        onClick={() => setOpenedTransaction({...item, amount, meta_info}) }/>
                })}
                { (loader && transactions?.list?.length === 0) &&
                    <div className="no-transactions-block">
                        <img src='img/no-transactions.svg' alt='noTransactions'/>
                        <h3>{text.NO_TRANSACTIONS}</h3>
                        <p>{text.NO_TRANSACTIONS_DESCRIPTION}</p>
                    </div>
                }  
                {
                    !loader && <Loader />
                }   
                <div className='center'>
                {!!transactions?.list?.length &&
                    <Pagination
                        current={page}
                        items={transactions?.count}
                        limit={transactions?.limit}
                        onChange={loadTransactionsByPage}
                    />
                }     
                </div>
            </Content>
            <Tabbar config={config}  bottomInset={bottomInset}/>
        </div>
    )
}

export default TransactionsPanel