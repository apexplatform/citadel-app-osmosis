import useApi from "../api/useApi";
import { ImplementationError, NetworkError } from "./Errors";
import store from "../../store/store";
import * as Sentry from "@sentry/react";
const api = useApi("wallet");
const apiTransactions = useApi("transactions");
const apiSocket = useApi("socket");
export default class Wallet {
  constructor(opts) {
    this.net = opts.network;
    this.name = opts.name;
    this.code = opts.code;
    this.address = opts.address;
    this.publicKey = opts.publicKey;
  }
  async prepareTransfer(params) {
    const data = await api.prepareBaseTransfer({
      network: this.net,
      from: this.address,
      transaction: params,
    });
    if (data.ok) {
      return data;
    } else {
      Sentry.captureException(
        data.error?.message || data.error?.message?.stack
      );
      if (data.error?.error_type === "custom_error")
        return new NetworkError(data.error?.message);
      return new Error(data.error?.message);
    }
  }
  async sendCustomMessage(type,message) {
    const { auth_token, socket_token } = store.getState().userReducer;
    const data = await apiSocket.sendCustomMessage({
      data: {
        to: 'main-front',
        from: auth_token,
        toDeviceId: socket_token,
        type,
        message
      },
      token: auth_token,
    });
    if (data.ok) {
      return data;
    } else {
      Sentry.captureException(
        data.error?.message || data.error?.message?.stack
      );
      if (data.error?.error_type === "custom_error")
        return new NetworkError(data.error?.message);
      return new Error(data.error?.message);
    }
  }
  async getTransactions(limit, offset) {
    const { auth_token } = store.getState().userReducer;
    const params = {
      auth_token,
      address: this.address,
      net: this.net,
      limit,
      offset,
    };
    const data = await apiTransactions.getTransactions(params);
    if (data.ok) {
      return data;
    } else {
      if (data.error.error_type === "custom_error")
        return new NetworkError(data.error?.message);
      return new Error(data.error?.message);
    }
  }
  prepareClaimRewards() {
    return new ImplementationError("Method not implemented!");
  }
  async getWalletBalance() {
    const { auth_token } = store.getState().userReducer;
    const data = await api.getWalletBalance({
      network: this.net,
      address: this.address,
      token: auth_token,
    });
    if (data?.ok) {
      return data;
    } else {
      Sentry.captureException(
        data?.error?.message || data?.error?.message?.stack
      );
      return new Error(data?.error?.message);
    }
  }
}
