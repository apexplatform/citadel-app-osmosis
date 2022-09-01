export const sortList = (list) => {
  let sortedList = list.sort(function(a,b) {
    if(a.balance === '~0') return 1
    if(b.balance === '~0') return 1
    if(a.balance === b.balance)
    {
      return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
    }
    else
    {
      return (a.balance < b.balance) ? 1 : -1;
    }
  })
  return sortedList
}

export const getSymbol = (token,tokenList) => {
  if(token.symbol !== "") {
    return token.symbol
  } else {
    let item = tokenList.find(elem => elem.fullDenom === token.denom)
    if(item){
      return item.code
    }else{
      return '-'
    }
  }
}

export const sortPoolAssetsList = (list) => {
  let sortedList = list.sort(function (a, b) {
    if (+a.usdPrice === +b.usdPrice) {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    } else {
      return +a.usdPrice < +b.usdPrice ? 1 : -1;
    }
  });
  return sortedList;
};

export const sortAssetsList = (list) => {
  let sortedList = list.sort(function (a, b) {
    if (+a.usdPrice === +b.usdPrice) {
      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    } else {
      return +a.usdPrice < +b.usdPrice ? 1 : -1;
    }
  });
  let filteredList = sortedList.filter((item) => item.code !== "OSMO");
  let osmoToken = sortedList.find((item) => item.code === "OSMO");
  if (osmoToken) {
    filteredList.unshift(osmoToken);
  }
  return filteredList;
};

export const sortPoolList = (list) => {
  let sortedList = list.sort(function (a, b) {
    let myLiquidity1 = a.myLiquidity
      .toString()
      .replace("$", "").replace('<', '')
      .replace(",", "");
    let myLiquidity2 = b.myLiquidity
      .toString()
      .replace("$", "").replace('<', '')
      .replace(",", "");
    if (+myLiquidity1 === +myLiquidity2) {
      return +a.id < +b.id ? -1 : +a.id > +b.id ? 1 : 0;
    } else {
      return +myLiquidity1 < +myLiquidity2 ? 1 : -1;
    }
  });
  return sortedList;
};

export const sortAllPoolList = (list) => {
  let sortedList = list.sort(function (a, b) {
    let myLiquidity1 = a.myLiquidity
      .toString()
      .replace("$", "").replace('<', '')
      .replace(",", "");
    let myLiquidity2 = b.myLiquidity
      .toString()
      .replace("$", "").replace('<', '')
      .replace(",", "");
    if (+myLiquidity1 === +myLiquidity2) {
      return +a.poolInfo[0]?.liquidity < +b.poolInfo[0]?.liquidity
        ? 1
        : +a.poolInfo[0]?.liquidity > +b.poolInfo[0]?.liquidity
        ? -1
        : 0;
    } else {
      return +myLiquidity1 < +myLiquidity2 ? 1 : -1;
    }
  });
  return sortedList;
};

export const getMyPoolList = (list) => {
  let myList = list?.filter(
    (elem) => +elem.myLiquidity.toString().replace("$", "").replace(",", "") > 0
  );
  let sortedList = myList?.sort(function (a, b) {
    let myLiquidity1 = a.myLiquidity
      .toString()
      .replace("$", "").replace('<', '')
      .replace(",", "");
    let myLiquidity2 = b.myLiquidity
      .toString()
      .replace("$", "").replace('<', '')
      .replace(",", "");
    if (+myLiquidity1 === +myLiquidity2) {
      return +a.poolInfo[0]?.liquidity < +b.poolInfo[0]?.liquidity
        ? 1
        : +a.poolInfo[0]?.liquidity > +b.poolInfo[0]?.liquidity
        ? -1
        : 0;
    } else {
      return +myLiquidity1 < +myLiquidity2 ? 1 : -1;
    }
  });
  return sortedList;
};
