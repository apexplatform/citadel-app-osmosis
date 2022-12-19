import { utils } from '@citadeldao/apps-sdk';

export const getResponse = async (url, address) => {
    const requestManager = new utils.RequestManager();
    const data = await requestManager.executeRequest(new utils.Request('get', address ? `${url}/${address}` : `${url}`));
    return data
};