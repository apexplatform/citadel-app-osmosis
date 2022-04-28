import { SET_SOCKET_TOKEN } from "../actions/types";
const qs = require("querystring");
const params = window.location.search.slice(1);
const paramsAsObject = qs.parse(params);
if(paramsAsObject?.token){
  localStorage.setItem('isAuthenticated',true)
}
const initialState = {
  auth_token: paramsAsObject?.token,
  socket_token: 'bf45abc1-1fa2-4c66-835a-9c6ff2952a31'
};
export default function (state = initialState, action) {
  switch (action.type) {
    case SET_SOCKET_TOKEN:
      return {
        ...state,
        socket_token: action.payload,
      };
    default:
      return state;
  }
}
