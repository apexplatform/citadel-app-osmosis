import {
  SET_ACTIVE_PANEL,
  SET_PREVIOS_PANEL,
  SET_ACTIVE_PAGE,
  SET_ACTIVE_MODAL,
  SET_LOADER,
} from "./types";

export const setActivePanel = (panel) => (dispatch) => {
  dispatch({
    type: SET_ACTIVE_PANEL,
    payload: panel,
  });
};

export const setActivePage = (page) => (dispatch) => {
  dispatch({
    type: SET_ACTIVE_PAGE,
    payload: page,
  });
};

export const setPreviosPanel = (panel) => (dispatch) => {
  dispatch({
    type: SET_PREVIOS_PANEL,
    payload: panel,
  });
};

export const setLoader = (status) => (dispatch) => {
  dispatch({
    type: SET_LOADER,
    payload: status,
  });
};

export const setActiveModal = (modal) => (dispatch) => {
  dispatch({
    type: SET_ACTIVE_MODAL,
    payload: modal,
  });
};
