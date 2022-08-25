import { types } from './types';
import { store } from "../store";

const setPreviousPanel = (panel) => {
    store.dispatch({
        type: types.SET_PREVIOUS_PANEL,
        payload: panel,
    });
};

const setLoader = (loader) => {
    store.dispatch({
        type: types.SET_LOADER,
        payload: loader,
    });
};

export const panelActions = {
    setPreviousPanel,
    setLoader
};