import { Icon20ChevronRightOutline } from "@vkontakte/icons";
import { Card } from "@vkontakte/vkui";
import "../styles/components/addressBlock.css";
import ROUTES from "../../routes";
import { connect } from "react-redux";
import { prettyNumber } from "../helpers/numberFormatter";
import { setActivePage } from "../../store/actions/panelActions";
import { fotmatAddress } from "../helpers/addressFormatter.js";
import Icon from "./Icon";
const AddressBlock = (props) => {
  const { currentWallet } = props.walletReducer;
  return (
    <Card
      onClick={() => props.setActivePage(ROUTES.SELECT_ADDRESS)}
      className="address-block-card"
    >
      {currentWallet ? (
        <div className="address-block">
          <div className="address-icon center">
            <Icon icon={currentWallet?.network} width={24} height={24} />
          </div>
          <div className="address-content">
            <div className="address-row">
              <p className="address-name">{currentWallet?.name}</p>
              <span className="address-text">
                ({fotmatAddress(currentWallet?.address)})
              </span>
            </div>
            <div className="address-row">
              <p className="address-block-amount">
                {prettyNumber(currentWallet?.balance?.mainBalance)}
              </p>
              <span className="address-network">{currentWallet?.code}</span>
            </div>
          </div>
          <Icon20ChevronRightOutline fill="#818C99" width={30} height={30} />
        </div>
      ) : null}
    </Card>
  );
};

const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
});

export default connect(mapStateToProps, { setActivePage })(AddressBlock);
