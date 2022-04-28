import { Panel, Search } from "@vkontakte/vkui";
import { useState } from "react";
import Header from "../uikit/Header";
import { connect } from "react-redux";
import AddressItem from "../uikit/AddressItem";
import ROUTES from "../../routes";
import text from "../../text.json";
const SelectAddressPanel = (props) => {
  const { wallets } = props.walletReducer;
  const [list, setList] = useState(wallets);
  const searchWallet = (wallet) => {
    let arr = wallets.filter(
      (item) =>
        item.code.substr(0, wallet.length).toLowerCase() ===
          wallet.toLowerCase() ||
        item.name.substr(0, wallet.length).toLowerCase() ===
          wallet.toLowerCase() ||
        item.address.substr(0, wallet.length).toLowerCase() ===
          wallet.toLowerCase()
    );
    setList(arr);
    if (wallet.length < 1) setList(wallets);
  };
  return (
    <Panel id={ROUTES.SELECT_ADDRESS}>
      <Header title={text.SELECT_ADDRESS} showTitle={true} back={true} />
      <Search
        after={null}
        placeholder={text.SEARCH}
        onChange={(e) => searchWallet(e.target.value)}
      />
      {list.map((item) => (
        <AddressItem item={item} key={item.address} />
      ))}
    </Panel>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
});

export default connect(mapStateToProps, {})(SelectAddressPanel);
