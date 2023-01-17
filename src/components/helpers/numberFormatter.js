import BigNumber from 'bignumber.js';

const cutNumber = (number, digits = 0) =>
    Math.floor(
        BigNumber(number)
        .multipliedBy(10 ** digits)
        .toNumber()
    ) /
    10 ** digits;

const formatValue = (value) => value.toString().trim().replaceAll(',', '');

export const prettyNumber = (value) => {
  if (!value) {
      return 0;
  }

  // for string with range (iost APY "4.8-36.13" etc)
  if (Number.isNaN(+value)) {
      return value;
  }
  const formatedValue = formatValue(value);
  const maxDecimals = 6;
  const prefix = +formatedValue < 0 ? '-' : '';
  const absoluteValue = Math.abs(formatedValue);

  // |value| < 1
  if (absoluteValue && cutNumber(absoluteValue, maxDecimals) === 0) {
      return '~0';
  }

  return `${prefix}${cutNumber(absoluteValue, maxDecimals)}`;
};

export const prettyNumberTooltip = (value) => {
    if (!value) {
      return '0';
    }

    if (Number.isNaN(+value)) {
      return value;
    }

    const formatedValue = formatValue(value);
    const maxDecimals = 8;

    return cutNumber(formatedValue, maxDecimals).toLocaleString('en', {
        maximumFractionDigits: maxDecimals,
    });
};

export const formatByDecimals = (num,decimal=6) => {
  if(+num > 0){
    let arr = num.toString().split('.')
    if(arr.length > 1){
      let drob = arr[1].substr(0,decimal)
      if(decimal===0){
        return arr[0]
      }
      return arr[0]+'.'+drob
    }
  }
  return num
}

export function numberWithCommas(x, decimals) {
  if (x) {
    if (+x === 0) {
      return x;
    }
    let numFixed = decimals ? x?.toFixed(decimals) : x;
    if (numFixed === "0.00") {
      return "~0";
    }
    var str = numFixed?.toString().split(".");
    str[0] = str[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return str.join(".");
  }
  return 0;
}


export const amountFormatter = (amount) => {
  amount = amount.toString().replace(/[^0-9\.]/g, '');
  if(amount.split(".").length - 1 !== 1 && amount[amount.length-1] === '.'){
    return amount.substr(0,amount.length-1)
  }
  if (amount.length === 2 && amount[1] !== "." && amount[1] === "0" && amount[0] === '0') {
    amount = amount[0]
  } else if (amount[0] === "0" && amount[1] !== ".") {
    amount = BigNumber(amount).toFixed()
  } 
  return amount
}

export function formatNumber(num, size = 10) {
  num = num.toString().replace(',','')
  const lookup = [
    { value: 1, symbol: "" },
    { value: 1e3, symbol: "k" },
    { value: 1e6, symbol: "M" },
    { value: 1e9, symbol: "G" },
    { value: 1e12, symbol: "T" },
    { value: 1e15, symbol: "P" },
    { value: 1e18, symbol: "E" }
  ];
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  var item = lookup.slice().reverse().find(function(item) {
    return +num >= item.value;
  });
  if(item){
    num = (+num / item.value)
  }
  let decimals = 10
  if(num.toString().includes('.')){
    let arr = num.toString().split('.')
    if(arr[0].length <= size){
      decimals = size - arr[0].length
    }
  }
  if(+num === 0){
    return "0"
  }
  if(item){
    return num.toFixed(decimals).replace(rx, "$1") + item.symbol
  }
  let result = num.toString().split('').slice(0,size).join('')
  if(result[-1] === '.'){
    return result.replace('.','')
  }
  return result
}