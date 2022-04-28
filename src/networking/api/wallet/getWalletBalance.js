export const getWalletBalance = (data) => {
  return {
    url: `/${data.network}/${data.address}/wallets/balance`,
    method: "get",
    data: {
      params: {
        token: data.token,
      },
    },
  };
};
