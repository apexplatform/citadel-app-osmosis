import { types } from '../actions/types'
const qs = require('querystring');
const params = window.location.search.slice(1);
const paramsAsObject = qs.parse(params);

const initialState = {
    previousPanel: '/',
    currentPanel: '/',
    loader: true,
    bottomInset: paramsAsObject.bottomInset,
    borderRadius: paramsAsObject.borderRadius
};
export default function PanelReducer(state=initialState,action){
    switch (action.type){
        case types.SET_PREVIOUS_PANEL:
            return {
                ...state,
                previousPanel: action.payload
            }
        case types.SET_CURRENT_PANEL:
            return {
                ...state,
                currentPanel: action.payload
            }
        case types.SET_LOADER:
            return {
                ...state,
                loader: action.payload,
            };    
        default:
            return state
    }
}