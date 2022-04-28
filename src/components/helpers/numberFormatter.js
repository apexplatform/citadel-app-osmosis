import BigNumber from "bignumber.js";
import { Dec, IntPretty } from "@keplr-wallet/unit";

const cutNumber = (number, digits = 0) =>
  Math.floor(
    BigNumber(number)
      .multipliedBy(10 ** digits)
      .toNumber()
  ) /
  10 ** digits;

const formatValue = (value) => value.toString().trim().replaceAll(",", "");

const classesAbb = {
  0: "",
  3: "K",
  6: "M",
  9: "B",
  12: "T",
  15: "q",
  18: "Q",
};
export const prettyNumber = (value) => {
  if (!value) return 0;
  //for string with range (iost APY "4.8-36.13" etc)
  if (Number.isNaN(+value)) return value;
  value = formatValue(value);
  const abbDecimals = 2;
  const maxDecimals = 5;
  let prefix = +value < 0 ? "-" : "";
  const absoluteValue = Math.abs(value);
  const intPart = Math.floor(absoluteValue);
  const valueRank = intPart === 0 ? 0 : intPart.toString().length;
  //|value| > 1
  if (valueRank > 0) {
    const classes = Object.keys(classesAbb).sort((a, b) => b - a);
    const valueClass = classes.find((i) => valueRank > i);
    return `${prefix}${cutNumber(
      absoluteValue / 10 ** valueClass,
      abbDecimals
    )}${classesAbb[valueClass]}`;
  }
  //|value| < 1
  if (absoluteValue && cutNumber(absoluteValue, maxDecimals) === 0) {
    return "~0";
  }
  return `${prefix}${cutNumber(absoluteValue, maxDecimals)}`;
};

export const formatNumber = (amount) => {
  const decval = +amount !== 0 ? new Dec(amount.toString()) : amount;
  const intval =
    +decval !== 0
      ? new IntPretty(decval).trim(true).maxDecimals(3).toString()
      : decval;
  return intval.toString().replaceAll(",", "");
};

export function numberWithCommas(x, decimals) {
  if (x) {
    if (+x == 0) {
      return x;
    }
    let numFixed = decimals ? x?.toFixed(decimals) : x;
    if (numFixed == "0.00") {
      return "~0";
    }
    var str = numFixed?.toString().split(".");
    str[0] = str[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return str.join(".");
  }
  return 0;
}


export const formatByDecimals = (num,decimal=6) => {
  if(num > 0){
    let arr = num.toString().split('.')
    if(arr.length > 1){
      let drob = arr[1].substr(0,decimal)
      if(decimal==0){
        return arr[0]
      }
      return arr[0]+'.'+drob
    }
  }
  return num
}