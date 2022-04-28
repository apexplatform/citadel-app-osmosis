import "../styles/components/nodeSelect.css";
import { Icon20ChevronRightOutline } from "@vkontakte/icons";
import { setActivePage, setPreviosPanel} from "../../store/actions/panelActions";
import { connect } from "react-redux";
import ROUTES from "../../routes";
import text from '../../text.json'
const NodeSelect = (props) => {
  const { selectedNode } = props;
  return (
    <div
      className="node-container"
      onClick={() => {
        props.setActivePage(ROUTES.SELECT_NODE);
        props.setPreviosPanel(ROUTES.CONTROL_BOND);
      }}
    >
      {selectedNode ? <div className="node-row">
        <img
          src={selectedNode?.imageSource || "img/icons/unsupported.svg"}
          alt="icon"
          className="node-img"
        />
        <span className="node-name">
          {selectedNode?.name}
        </span>
        <Icon20ChevronRightOutline
          className="node-right-arrow"
          fill="#C5D0DB"
          width={25}
          height={25}
        />
      </div> : 
      <div className="node-row">
        <p className="grey-text">{text.WITHOUT_DELEGATION}</p>
        <Icon20ChevronRightOutline
          className="node-right-arrow"
          fill="#C5D0DB"
          width={25}
          height={25}
        />
      </div>}
    </div>
  );
};
const mapStateToProps = (state) => ({
  walletReducer: state.walletReducer,
});

export default connect(mapStateToProps, { setActivePage, setPreviosPanel })(
    NodeSelect
);
