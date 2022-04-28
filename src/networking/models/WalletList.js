import { ValidationError } from "./Errors";
import { getWalletConstructor } from "../../store/actions/walletActions";
import store from "../../store/store";
import * as Sentry from "@sentry/react";
import { SET_CURRENT_WALLET } from "../../store/actions/types";
import { networks } from './network.js'
export class WalletList {
  getWallets() {
    try {
      const qs = require("querystring");
      const params = window.location.search.slice(1);
      const paramsAsObject = qs.parse(params);
      let arr = JSON.parse(paramsAsObject.wallets);
      let wallets = arr.length
        ? eval(paramsAsObject.wallets).map((item) => {
            return {
              address: item?.address,
              network: item?.net,
              name: networks[item?.net].name,
              code: networks[item?.net].code,
              publicKey: item?.publicKey,
              getTxUrl:  networks[item?.net].getTxUrl
            };
          })
        : new ValidationError("error");
      return wallets;
    } catch (e) {
      return new ValidationError(e);
    }
  }
  loadWalletsWithBalances(action) {
    const wallets = this.getWallets();
    if (wallets instanceof ValidationError) {
      return wallets;
    }
    try {
      if (wallets.length > 0) {
        wallets.forEach(async (item, i) => {
          const wallet = getWalletConstructor(item);
          if (wallet) {
            let response = await wallet.getWalletBalance();
            if (response.ok) {
              item.balance = response.data;
            } else {
              if (action) {
                Sentry.captureException(
                  "Second Osmosis balance request was failed!"
                );
              }
            }
          }
          if (i == 0) {
            store.dispatch({
              type: SET_CURRENT_WALLET,
              payload: item,
            });
          }
        });
      }
    } catch {
      if (action) {
        Sentry.captureException("Second Osmosis balance request was failed!");
      }
    }
    return wallets;
  }
}

