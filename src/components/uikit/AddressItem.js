import { fotmatAddress } from "../helpers/addressFormatter";
import { Card } from "@vkontakte/vkui";
import { connect } from "react-redux";
import ROUTES from "../../routes";
import { setCurrentWallet } from "../../store/actions/walletActions";
import { setActivePage } from "../../store/actions/panelActions";
import "../styles/components/addressItem.css";
import { numberWithCommas } from "../helpers/numberFormatter";
import Icon from "./Icon";
const AddressItem = (props) => {
  const { currentWallet } = props.walletReducer;
  const { item } = props;
  let active = currentWallet.address === item.address && "active-address";
  const selectAddress = () => {
    props.setCurrentWallet(item);
    props.setActivePage(ROUTES.HOME);
  };
  return (
    <Card className={active + " address-card"} onClick={() => selectAddress()}>
      <div className="address-item">
        <div className="address-icon center">
          <Icon icon={item?.network} width={24} fill={currentWallet.address === item.address ? '#792EC0' : '#fff'} height={24} />
        </div>
        <div className="address-content">
          <div className="address-row">
            <p className="address-name">{item.name}</p>
            <span className="address">({fotmatAddress(item.address)})</span>
          </div>
          <div className="address-row">
            <p className="address-name address-amount">
              {numberWithCommas(item.balance?.mainBalance)}
            </p>
            <span className="address-network">{item.network}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer
});

export default connect(mapStateToProps, { setCurrentWallet, setActivePage })(
  AddressItem
);
