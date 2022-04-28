import axios from "axios";
export function useAxios(url) {
  const axiosInstance = axios.create({
    baseURL: url || process.env.REACT_APP_BACKEND_URL
  });
  const responseHandler = (response) => {
    return response.data;
  };

  const errorHandler = (error) => {
    return error?.response?.data;
  };

  axiosInstance.interceptors.response.use(responseHandler, errorHandler);

  return axiosInstance;
}
