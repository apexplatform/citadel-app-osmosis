import { useState, useEffect } from "react";
import { Card, Group, Search, Tabs, TabsItem } from "@vkontakte/vkui";
import PoolItem from "../uikit/PoolItem";
import ROUTES from "../../routes";
import Header from "../uikit/Header";
import Loader from "../uikit/Loader";
import { sortPoolList, sortAllPoolList, getMyPoolList } from "../helpers/index";
import { connect } from "react-redux";
import { setSelectedPool, setIsSuperfluidLock } from "../../store/actions/poolActions";
import { setActivePage } from "../../store/actions/panelActions";
import text from "../../text.json";
const Pool = (props) => {
  const { incentivizedPools, allPools } = props.poolReducer;
  const [activeTab, setActiveTab] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [myPools, setMyPools] = useState(
    allPools?.length ? getMyPoolList(allPools) : null
  );
  const [allPoolsList, setAllPools] = useState(
    allPools?.length ? sortAllPoolList(allPools) : null
  );
  const [incentivizedList, setIncentivizedList] = useState(
    incentivizedPools?.length ? sortPoolList(incentivizedPools) : null
  );
  const setPool = (item) => {
    props.setActivePage(ROUTES.POOL_DETAILS);
    props.setSelectedPool(item);
    props.setIsSuperfluidLock(false)
  };
  useEffect(() => {
    setAllPools(allPools ? sortAllPoolList(allPools) : null);
    setMyPools(allPools ? getMyPoolList(allPools) : null);
    setIncentivizedList(
      incentivizedPools ? sortPoolList(incentivizedPools) : null
    );
  }, [incentivizedPools, allPools]);
  const findPool = (pool, name) => {
    let str =
      "pool#" + pool.id + pool.poolInfo[0]?.symbol + pool.poolInfo[1]?.symbol;
    if (str.toLowerCase().includes(name.toLowerCase())) {
      return true;
    }
    return false;
  };
  const searchPool = (name) => {
    setSearchText(name);
    if (name.length >= 1) {
      if (activeTab === "all") {
        setAllPools(allPools.filter((pool) => findPool(pool, name)));
      }
      if (activeTab === "incentivized") {
        setIncentivizedList(
          incentivizedPools.filter((pool) => findPool(pool, name))
        );
      }
      if (activeTab === "myPools") {
        setMyPools(
          getMyPoolList(allPools.filter((pool) => findPool(pool, name)))
        );
      }
    } else {
      if (activeTab === "all") {
        setAllPools(allPools);
      }
      if (activeTab === "incentivized") {
        setIncentivizedList(incentivizedPools);
      }
      if (activeTab === "myPools") {
        setMyPools(getMyPoolList(allPools));
      }
    }
  };
  return (
    <Group className="pools-list-block">
      <div className="fixed-header">
        <Header />
        <Tabs>
          <TabsItem
            onClick={() => {
              setActiveTab("all");
              setSearchText("");
            }}
            selected={activeTab === "all"}
          >
            {text.ALL}
          </TabsItem>
          <TabsItem
            onClick={() => {
              setActiveTab("incentivized");
              setSearchText("");
            }}
            selected={activeTab === "incentivized"}
          >
            {text.INCENTIVIZED_POOLS}
          </TabsItem>
          <TabsItem
            onClick={() => {
              setActiveTab("myPools");
              setSearchText("");
            }}
            selected={activeTab === "myPools"}
          >
            {text.MY_POOLS}
          </TabsItem>
        </Tabs>
        <Search
          after={null}
          value={searchText}
          className="search-pool"
          placeholder={text.SEARCH}
          onChange={(e) => searchPool(e.target.value)}
        />
      </div>
      <div className="pool-content">
        {allPoolsList && activeTab == "all" ? (
          allPoolsList?.map((item, i) => (
            <Card className="pool-card" key={i} onClick={() => setPool(item)}>
              <PoolItem name="all" item={item} />
            </Card>
          ))
        ) : incentivizedList && activeTab == "incentivized" ? (
          incentivizedList?.map((item, i) => (
            <Card className="pool-card" key={i} onClick={() => setPool(item)}>
              <PoolItem name={"incentivized"} item={item} />
            </Card>
          ))
        ) : myPools && activeTab == "myPools" ? (
          myPools?.map((item, i) => (
            <Card className="pool-card" key={i} onClick={() => setPool(item)}>
              <PoolItem name={"incentivized"} item={item} />
            </Card>
          ))
        ) : (
          <Loader id="centered-loader" />
        )}
      </div>
    </Group>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { setIsSuperfluidLock, setActivePage, setSelectedPool })(
  Pool
);
