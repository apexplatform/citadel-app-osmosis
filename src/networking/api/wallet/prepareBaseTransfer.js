export const prepareBaseTransfer = (data) => {
  return {
    url: `/${data.network}/${data.from}/prepareCustomTransaction`,
    method: 'post',
    data: data.transaction
  }
}