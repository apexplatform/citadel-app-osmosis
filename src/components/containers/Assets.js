import { useState, useEffect } from "react";
import { Group, Tabs, TabsItem } from "@vkontakte/vkui";
import Header from "../uikit/Header";
import Loader from "../uikit/Loader";
import { connect } from "react-redux";
import { setSelectedPool } from "../../store/actions/poolActions";
import { setActivePage } from "../../store/actions/panelActions";
import { getMyPoolList } from "../helpers/index";
import "../styles/panels/assets.css";
import AssetsBlock from "../uikit/AssetsBlock";
import AssetsInfoCard from "../uikit/AssetsInfoCard";
import * as Sentry from "@sentry/react";
import { sortAssetsList, sortPoolAssetsList } from "../helpers/index";
import { loadWalletWithBalances } from "../../store/actions/walletActions";
const Assets = (props) => {
  const { osmoPrice, allPools } = props.poolReducer;
  const { tokenList, usdPrices, currentWallet } = props.walletReducer;
  const [activeTab, setActiveTab] = useState("assets");
  const assets = tokenList
    ?.filter((elem) => elem.balance > 0 || elem.code == "OSMO")
    ?.map((elem) => {
      if (elem.code == "OSMO") {
        elem.usdBalance = currentWallet?.balance?.mainBalance * +osmoPrice;
        elem.balance = currentWallet?.balance?.mainBalance;
      } else if (elem.code == "STARS") {
        elem.usdBalance = +elem.balance * (+usdPrices?.stargaze?.usd || 0);
      } else {
        elem.usdBalance = +elem.balance * +elem.USD;
      }
      return elem;
    });
  const [assetsList, setAssetsList] = useState(
    assets ? sortAssetsList(assets) : []
  );
  let pools = allPools?.length ? getMyPoolList(allPools) : null;
  let poolAssets = pools?.map((item) => {
    return {
      name: "Pool #" + item.id,
      logoURI: "img/tokens/osmosis.svg",
      usdBalance: item.myLiquidity.replace("$", "").replace(",", ""),
      code: "GAMM/" + item.id,
      symbol:
        (item.poolInfo[0]?.symbol || fotmatAddress(item.poolInfo[0]?.denom)) +
        "/" +
        (item.poolInfo[1]?.symbol || fotmatAddress(item.poolInfo[1]?.denom)),
      balance: item.allGammShare?.maxDecimals(6).trim(true).toString() || 0,
      pool: item,
    };
  });
  const [poolAssetsList, setPoolAssetsList] = useState(
    poolAssets ? sortPoolAssetsList(poolAssets) : []
  );
  useEffect(() => {
    if (!currentWallet?.balance?.mainBalance) {
      Sentry.captureException("First Osmosis balance request was failed!");
      props.loadWalletWithBalances(true);
    }
    pools = allPools?.length ? getMyPoolList(allPools) : null;
    poolAssets = pools?.map((item) => {
      return {
        name: "Pool #" + item.id,
        logoURI: "img/tokens/osmosis.svg",
        usdBalance: item.myLiquidity.replace("$", "").replace(",", ""),
        code: "GAMM/" + item.id,
        symbol:
          (item.poolInfo[0]?.symbol || fotmatAddress(item.poolInfo[0]?.denom)) +
          "/" +
          (item.poolInfo[1]?.symbol || fotmatAddress(item.poolInfo[1]?.denom)),
        balance: item.allGammShare?.maxDecimals(6).trim(true).toString() || 0,
        pool: item,
      };
    });
    setAssetsList(assets ? sortAssetsList(assets) : [])
    setPoolAssetsList(poolAssets ? sortPoolAssetsList(poolAssets) : []);
  }, [allPools,tokenList]);
  return (
    <Group className="pools-list-block">
      <Header />
      {
      osmoPrice &&
      currentWallet?.balance?.mainBalance &&
      tokenList &&
      allPools ? (
        <div>
          <AssetsBlock />
          <Tabs className="assets-tabs">
            <TabsItem
              onClick={() => setActiveTab("assets")}
              selected={activeTab === "assets"}
            >
              Assets
            </TabsItem>
            <TabsItem
              onClick={() => setActiveTab("pool-assets")}
              selected={activeTab === "pool-assets"}
            >
              Pool assets
            </TabsItem>
          </Tabs>
          {activeTab == "assets"
            ? assetsList?.map((item, i) => (
                <AssetsInfoCard item={item} key={i} symbol={"$"} />
              ))
            : activeTab == "pool-assets"
            ? poolAssetsList?.map((item, i) => (
                <AssetsInfoCard
                  name="pool-assets"
                  item={item}
                  key={i}
                  symbol={"$"}
                  manage={true}
                />
              ))
            : ""}
        </div>
      ) : (
        <Loader id="centered-loader" />
      )}
    </Group>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, {
  loadWalletWithBalances,
  setActivePage,
  setSelectedPool,
})(Assets);
