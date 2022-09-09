import { utils } from '@citadeldao/apps-sdk';

const getNetworks = () => {
    return new utils.Request(
        'get',
        `${process.env.REACT_APP_RESTAKE_URL}/networks`,
    );
};

const getValidators = ({ net, address }) => {
    return new utils.Request(
        'get',
        `${process.env.REACT_APP_RESTAKE_URL}/${net}/${address}/stake-list`,
    );
};

const getDelegatorStatus = ({ net, address }) => {
    return new utils.Request(
        'get',
        `${process.env.REACT_APP_RESTAKE_URL}/${net}/${address}/status`,
    );
};

const getNetworkConfig = (net) => {
    return new utils.Request(
        'get',
        `${process.env.REACT_APP_RESTAKE_URL}/${net}/config`,
    );
};

const getBalances = ({ net, address }) => {
    return new utils.Request(
        'get',
        `${process.env.REACT_APP_RESTAKE_URL}/${net}/${address}/stats`,
    );
};

const postPermissionRestake = ({ net, address, transaction }) => {
    return new utils.Request(
        'post',
        `${process.env.REACT_APP_RESTAKE_URL}/${net}/${address}/permission`,
        { data: transaction },
    );
};

const deleteRestakeAddress = ({ net, address }) => {
    return new utils.Request(
        'delete',
        `${process.env.REACT_APP_RESTAKE_URL}/${net}/${address}/restake`,
    );
};

export const restake = {
    getNetworks,
    getValidators,
    getDelegatorStatus,
    getNetworkConfig,
    postPermissionRestake,
    getBalances,
    deleteRestakeAddress,
};