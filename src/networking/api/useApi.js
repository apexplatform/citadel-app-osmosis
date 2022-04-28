import { apies } from "./apies";
import { useAxios } from "./useAxios";

export default function useApi(type = "general", url = null) {
  let axiosInstance = useAxios(url);
  let api = {};
  const patterns = apies[type];
  Object.keys(patterns).map((patternName) => {
    const request = (data) => {
      const pattern = patterns[patternName](data);
      return axiosInstance[pattern.method](pattern.url, pattern.data);
    };
    api[patternName] = request;
  });
  return api;
}
