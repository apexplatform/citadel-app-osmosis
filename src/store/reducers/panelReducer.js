import {
  SET_ACTIVE_PANEL,
  SET_PREVIOS_PANEL,
  SET_ACTIVE_PAGE,
  SET_LOADER,
  SET_ACTIVE_MODAL,
} from "../actions/types";
import ROUTES from "../../routes";
const initialState = {
  activePage: ROUTES.HOME,
  activePanel: ROUTES.SWAP,
  activeModal: null,
  loader: false,
  previousPanel: ROUTES.HOME,
};
export default function (state = initialState, action) {
  switch (action.type) {
    case SET_ACTIVE_PANEL:
      return {
        ...state,
        activePanel: action.payload,
      };
    case SET_LOADER:
      return {
        ...state,
        loader: action.payload,
      };
    case SET_PREVIOS_PANEL:
      return {
        ...state,
        previousPanel: action.payload,
      };
    case SET_ACTIVE_PAGE:
      return {
        ...state,
        activePage: action.payload,
      };
    case SET_ACTIVE_MODAL:
      return {
        ...state,
        activeModal: action.payload,
      };
    default:
      return state;
  }
}
