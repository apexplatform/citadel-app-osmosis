import {SET_SOCKET_TOKEN} from './types';
import axios from "axios";
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL_2,
  withCredentials: true,
});
export const loadSocketToken = () => (dispatch) => {
    try {
      axiosInstance.get('/api/profile/socket').then((res) => {
        dispatch({
          type: SET_SOCKET_TOKEN,
          payload: res.data?.data,
        })
      });
    } catch {}
  };