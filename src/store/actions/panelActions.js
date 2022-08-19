import { types } from './types';
import { store } from "../store";

const setPreviousPanel = (panel) => {
    store.dispatch({
        type: types.SET_PREVIOUS_PANEL,
        payload: panel,
    });
};

export const panelActions = {
    setPreviousPanel,
};