import io from 'socket.io-client'
import { SET_WALLETS, SET_SIGNED_MESSAGE, SET_TO_TOKEN, SET_FROM_TOKEN, SET_TOKEN_LIST } from '../../store/actions/types';
import store from "../../store/store";
import { updatePoolList } from '../../store/actions/poolActions';
const { auth_token } = store.getState().userReducer;
const socket = io(
	process.env.REACT_APP_SOCKET_URL,
	{
		transports: ['websocket'],
		upgrade: false,
		query: {
			token: auth_token
		},
		reconnection: true
	}
);

socket.on('connect',()=>{
	console.log('connected')
})

socket.on('message-from-front',(data)=>{
	console.log('message-from-front in app', data)
	if(data?.type == 'transaction' && data?.message == 'SUCCESS'){
		const { transactionResponse } = store.getState().walletReducer
		if(transactionResponse && transactionResponse.meta_info){
			if(!transactionResponse.meta_info[0]?.title.includes('Swap')){
				let interval = null;
				let tryAgain = true;
				let count = 0;
				if (tryAgain) {
				  interval = setInterval(async () => {
					count++;
					tryAgain = await store.dispatch(updatePoolList());
					if (!tryAgain || count > 3) {
					  clearInterval(interval);
					}
				  }, 15000);
				}
				if (!tryAgain || count > 3) {
				  clearInterval(interval);
				}
			}
		}
	}
	if(data?.type == 'message'){
		store.dispatch({
			type: SET_SIGNED_MESSAGE,
			payload: data?.message,
		  });
	}
})


socket.on('address-balance-updated-app',(data)=>{
	console.log('address-balance-updated-app', data)
	const {wallets,tokenList,fromToken, toToken} = store.getState().walletReducer
	if(data.address && data.balance && data.net){
		wallets.map(item => {
			if(item.address == data.address && item.network == data.net){
				item.balance = data.balance
			}
		})
		store.dispatch({
			type: SET_WALLETS,
			payload: wallets,
		  });
		tokenList.map(item => {
			if(item.address == data.address && item.net == data.net){
				item.balance = data.balance?.mainBalance
			}
		})
		if(fromToken.net==data.net){
			fromToken.balance = data.balance?.mainBalance
			store.dispatch({
				type: SET_FROM_TOKEN,
				payload: fromToken,
			  });
		}
		if(toToken.net==data.net){
			toToken.balance = data.balance?.mainBalance
			store.dispatch({
				type: SET_TO_TOKEN,
				payload: toToken
			});
		}
		store.dispatch({
		type: SET_TOKEN_LIST,
		payload: tokenList,
		});
	}
})


socket.on('mempool-add-tx-app',(data)=>{
	console.log('mempool-add-tx-app', data)
})

socket.on('mempool-remove-tx-app',(data)=>{
	console.log('mempool-remove-tx-app', data)
})

export default socket