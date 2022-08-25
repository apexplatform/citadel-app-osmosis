import React, {useEffect} from 'react';
import { Content, Header, Table, BigButtons } from '@citadeldao/apps-ui-kit/dist/main';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { panelActions } from '../../store/actions';
import { useLocation } from 'react-router-dom';
import ROUTES from '../../routes';
import moment from "moment";

const ManageBondPanel = () => {
    const { pool } = useSelector(state => state.pool)
    const navigate = useNavigate()
    const location = useLocation()
    const back = () => navigate(ROUTES.POOL_DETAILS)
    useEffect(() => {  
        panelActions.setPreviousPanel(location.pathname)
        // eslint-disable-next-line
    },[])
    const columns2 = [
        {
            title: '',
            key: 'title',
            color: '#292929',
            fontWeight: 700,
            align: 'left',
            width: '21%',
        },
        {
            title: 'a day',
            key: 'day1',
            color: '#D900AB',
            align: 'left',
            fontWeight: 700,
            width: '26%',
        },
        {
            title: '7 days',
            key: 'days7',
            color: '#D900AB',
            fontWeight: 700,
            align: 'left',
            width: '26%',
        },
        {
            title: '14 days',
            key: 'days14',
            color: '#D900AB',
            fontWeight: 700,
            align: 'left',
            width: '26%',
        }
    ]
    const bondings = [
        {
            title: 'Current ARY',
            day1: <p className='table-apy-bold'>{pool?.lockDurations[0]?.apr}<span>%</span></p>,
            days7: <p className='table-apy-bold'>{pool?.lockDurations[1]?.apr}<span>%</span></p>,
            days14: <p className='table-apy-bold'>{pool?.lockDurations[2]?.apr}<span>%</span></p>,
        },
        {
            title: 'Amount',
            day1: <p className='table-amount-bold'>{pool?.lockDurations[0]?.lockup.amount.maxDecimals(2).trim(true).toString() || 0}<span>GAMM/{pool.id}</span></p>,
            days7: <p className='table-amount-bold'>{pool?.lockDurations[1]?.lockup.amount.maxDecimals(2).trim(true).toString() || 0}<span>GAMM/{pool.id}</span></p>,
            days14: <p className='table-amount-bold'>{pool?.lockDurations[2]?.lockup.amount.maxDecimals(2).trim(true).toString() || 0}<span>GAMM/{pool.id}</span></p>,
        }
    ];
    const unbondings = [
        {
            title: 'Unbonding Complete',
            day1: <p className='table-date-normal'>-</p>,
            days7: <p className='table-date-normal'>-</p>,
            days14: <p className='table-date-normal'>-</p>,
        },
        {
            title: 'Amount',
            day1: <p className='table-amount-bold'>-</p>,
            days7: <p className='table-amount-bold'>-</p>,
            days14: <p className='table-amount-bold'>-</p>,
        }
    ];
    if(pool?.unlockingDatas?.length){
        unbondings?.forEach(elem => {
            pool.unlockingDatas.forEach(item => {
                Object.keys(elem).forEach(key => {
                    if(key.includes(item.duration.asDays())){
                        if(elem.title === 'Amount'){
                            elem[key] = <p className='table-amount-bold'>{item.amount?.maxDecimals(2).trim(true).toString() || 0}<span>GAMM/{pool.id}</span></p>
                        }else{
                            elem[key] =  <p className='table-date-normal'>{moment(item.endTime).fromNow()}</p>
                        }
                    }
                })
            })
        })
    }
    return (
        <div className='panel'>
            <Content>
                <Header border title="Manage your bond" style={{margin: '8px 0 16px 0'}} onClick={() => back()} back={true}/>
                <div className='center'>
                    <h2 className='manage-bond-h2'>My Bondings</h2>
                </div>
                <Table 
                    columns={columns2}
                    data={bondings}
                />
                <div className='manage-bond-btns-row'>
                    <BigButtons onClick={() => navigate(ROUTES.BOND)} text='Bond' textColor='#FFFFFF' bgColor='#7C63F5'  hideIcon={true}/>
                    <BigButtons onClick={() => navigate(ROUTES.UNBOND)} text='Unbond' textColor='#FFFFFF' bgColor='#0095D6'  hideIcon={true}/>
                </div>
                {pool.unlockingDatas?.length > 0 && 
                <div className='center'>
                    <h2 className='manage-bond-h2'>Unbondings</h2>
                </div>}
                {pool.unlockingDatas?.length > 0 && 
                <Table 
                    columns={columns2}
                    data={unbondings}
                />}
            </Content>
        </div>
    )
}

export default ManageBondPanel