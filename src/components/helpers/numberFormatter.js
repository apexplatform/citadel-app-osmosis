import BigNumber from 'bignumber.js';

const cutNumber = (number, digits = 0) =>
    Math.floor(
        BigNumber(number)
        .multipliedBy(10 ** digits)
        .toNumber()
    ) /
    10 ** digits;

const formatValue = (value) => value.toString().trim().replaceAll(',', '');

export const prettyNumber = (value, maxDecimals=6) => {
    if (!value) {
        return 0;
    }

    // for string with range (iost APY "4.8-36.13" etc)
    if (Number.isNaN(+value)) {
        return value;
    }
    const formatedValue = formatValue(value);
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
  amount = amount.toString().replace(/[^0-9\.]/g, "");
  if (amount.length === 2 && amount[1] !== "." && amount[1] === "0" && amount[0] === '0') {
    amount = amount[0]
  } else if (amount[0] === "0" && amount[1] !== ".") {
    amount = BigNumber(amount).toFixed()
  } 
  return amount
}