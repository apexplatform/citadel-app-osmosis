export const getTokenBalance = (data) => {
  return {
    url: `/${data.network}/${data.address}/wallets/allTokenBalance`,
    method: "get",
    data: {
      params: {
        token: data.token,
      },
    },
  };
};
