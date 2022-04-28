import ROUTES from "../../routes";
import { Panel, Search } from "@vkontakte/vkui";
import Header from "../uikit/Header";
import { connect } from "react-redux";
import NodeItem from "../uikit/NodeItem";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import text from "../../text.json";
const SelectNodePanel = (props) => {
  const { stakeNodes } = props.poolReducer;
  const [page, setPage] = useState(1);
  const [list, setList] = useState(stakeNodes.slice(0,page*10));
  const searchNode = (val) => {
    if(val.length){
      setList(stakeNodes.filter((node) => node.name.toLowerCase().includes(val.toLowerCase())))
    }else{
      setList(stakeNodes.slice(0,10))
    }
  }
  return (
    <Panel id={ROUTES.SELECT_ADDRESS}>
      <Header title={text.SELECT_VALIDATOR} showTitle={true} back={true} />
      <Search
        after={null}
        placeholder={text.SEARCH}
        onChange={(e) => searchNode(e.target.value)}
      />
       <InfiniteScroll
            className="transactions-grid"
            dataLength={list?.length}
            next={() => {
              setList(stakeNodes.slice(0,(page+1)*10));
              setPage(page + 1);
            }}
            hasMore={page < 18}
          >
          <NodeItem hide={true} item={{name: text.WITHOUT_DELEGATION, imageSource: 'img/icons/without.svg'}} key={Math.random()} />
        { list?.map((item) => (
          <NodeItem item={item} key={Math.random()} />
        ))}
      </InfiniteScroll>
    </Panel>
  );
};

const mapStateToProps = (state) => ({
    poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, {})(SelectNodePanel);
