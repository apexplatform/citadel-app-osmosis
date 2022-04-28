import defaultConfig from "./default-config.json";
import customConfig from "./custom-config.json";
export class Config {
  tabbarParamsFromConfig(param) {
    if (customConfig["TABBAR"][param]) {
      return customConfig["TABBAR"][param];
    } else {
      console.warn("Provide custom TABBAR " + param);
    }
    return defaultConfig["TABBAR"][param];
  }
  headerParamsFromConfig(param) {
    if (customConfig["HEADER"][param]) {
      return customConfig["HEADER"][param];
    } else {
      console.warn("Provide custom HEADER " + param);
    }
    return defaultConfig["HEADER"][param];
  }

  get showAddressBlock() {
    if (customConfig.DEFAULT_ADDRESS_BLOCK) {
      return customConfig.DEFAULT_ADDRESS_BLOCK;
    } else {
      console.warn("Provide DEFAULT_ADDRESS_BLOCK!");
    }
    return defaultConfig.DEFAULT_ADDRESS_BLOCK;
  }
}
