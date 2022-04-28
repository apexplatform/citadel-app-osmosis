import ROUTES from "../../routes";
import { Panel, Search } from "@vkontakte/vkui";
import Header from "../uikit/Header";
import { connect } from "react-redux";
import TokenItem from "../uikit/TokenItem";
import { useEffect, useState } from "react";
import { sortList } from "../helpers";
import Loader from "../uikit/Loader";
import text from "../../text.json";
const SelectTokenPanel = (props) => {
  const { tokenList, currentToken, fromToken, toToken } = props.walletReducer;
  const [list, setList] = useState(tokenList ? sortList(tokenList) : []);
  const [loader, setLoader] = useState(tokenList && tokenList.length > 5);
  const [token, searchToken] = useState("");
  useEffect(() => {
    if (tokenList && tokenList.length > 5) {
      let arr = tokenList
      if (token.length > 0) {
        arr = tokenList.filter(
          (item) =>
            item.name.toLowerCase().includes(token.toLowerCase()) ||
            item.code.toLowerCase().includes(token.toLowerCase())
        );
      }
      if (currentToken === "from") {
        arr = arr?.filter((token) => token?.net !== toToken?.net)
      } else {
        arr = arr?.filter((token) => token?.net !== fromToken?.net)
      }
      setList(sortList(arr));
    }
    setLoader(tokenList && tokenList.length > 5);
  }, [loader, tokenList, token]);
  return (
    <Panel id={ROUTES.SELECT_TOKEN}>
      <Header title={text.SELECT_TOKEN} showTitle={true} back={true} />
      <Search
        after={null}
        placeholder={text.SEARCH}
        onChange={(e) => searchToken(e.target.value)}
      />
      {loader ? (
        list?.map((item) => (
          <TokenItem item={item} withAmount={true} key={Math.random()} />
        ))
      ) : (
        <Loader id="centered-loader" />
      )}
    </Panel>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
});

export default connect(mapStateToProps, {})(SelectTokenPanel);
