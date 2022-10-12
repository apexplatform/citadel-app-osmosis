export const formatAddress = (address) => {
    if (address?.length > 20) {
      return (
        address.slice(0, 6) +
        "****" +
        address.slice(address.length - 4, address.length)
      );
    }
    return address;
  };
  
export const formatPoolName = (address,size=18) => {
  if (address?.length > 20) {
    return (
      address.toUpperCase().slice(0, size) +
      '...' 
    );
  }
  return address?.toUpperCase();
};
  