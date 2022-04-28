export const sendCustomMessage = (params) => {
    return {
      url: `/customMsg?token=${params.token}`,
      method: "post",
      data: params.data
    };
  };
  