import { getRequest } from '../requests/getRequest';
import { ImplementationError } from './Errors';
import { store } from '../../store/store';
import * as Sentry from '@sentry/react';
import { utils } from '@citadeldao/apps-sdk';

const walletRequest = getRequest('wallet');
const transactionsRequest = getRequest('transactions');
const requestManager = new utils.RequestManager();

export default class Wallet {
    constructor(opts) {
        this.net = opts.network;
        this.name = opts.name;
        this.code = opts.code;
        this.address = opts.address;
        this.publicKey = opts.publicKey;
    }

    async prepareTransfer(params) {
        const { auth_token } = store.getState().user;

        try {
            const data = await requestManager.send(walletRequest.prepareBaseTransfer({
                network: this.net,
                from: this.address,
                transaction: { ...params, token: auth_token, publicKey: this.publicKey },
            }));

            if (data.ok) {
                return data;
            }else{
                return new Error(data?.error?.message || data?.error)
            }
        } catch (e) {
            Sentry.captureException(e.response?.data?.error?.message || e.response?.data?.error);
            return new Error(e.response?.data?.error?.message || e.response?.data?.error);
        }
    }

    async getTransactions(page) {
        const { auth_token } = store.getState().user;
        const params = {
            auth_token,
            address: this.address,
            net: this.net,
            offset: page-1
        };
    
        try {
            const data = await requestManager.send(transactionsRequest.getTransactions(params));
            if (data.ok) {
                return data;
            }
        } catch (e) {
            Sentry.captureException(e.response?.data?.error);
            return new Error(e.response?.data?.error);
        }
    }

    prepareClaimRewards() {
        return new ImplementationError('Method not implemented!');
    }

    async getWalletBalance() {
        const { auth_token } = store.getState().user;
        const requestManager = new utils.RequestManager();
        try {
            const data = await requestManager.send(walletRequest.getWalletBalance({
                network: this.net,
                address: this.address,
                token: auth_token,
            }));
            if (data?.ok) {
                return data;
            }
        } catch (e) {
            return null;
        }
    }
  async getAllTokenBalance() {
    const {auth_token} = store.getState().user
    try{
      const requestManager = new utils.RequestManager()
      const data = await requestManager.executeRequest(walletRequest.getAllTokenBalance({
        network: this.net,
        address: this.address,
        token: auth_token
      }));
      if (data?.ok) {
        return data;
      }
    }catch(e){
      return null;
    }
  }
}