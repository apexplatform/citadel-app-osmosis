import { Card } from "@vkontakte/vkui";
import { connect } from "react-redux";
import "../styles/components/tokenItem.css";
import { setActivePage, setPreviosPanel } from "../../store/actions/panelActions";
import ROUTES from "../../routes";
import { setPoolMethod, setSelectedNode, prepareSuperfluidDelegate } from "../../store/actions/poolActions";

const NodeItem = (props) => {
  const {item} = props
  const { previousPanel } = props.panelReducer;
  const { pool } = props.poolReducer;
  const selectToken = (item) => {
    if(previousPanel == ROUTES.POOL_DETAILS){
      props.setActivePage(ROUTES.POOL_DETAILS);
      props.prepareSuperfluidDelegate(item,pool.lockDurations.find(item => item.duration == 14))
    }else{
      if(props.hide){
        props.setSelectedNode(null)
      }else{
        props.setSelectedNode(item)
      }
      props.setPoolMethod('bond');
      props.setPreviosPanel(ROUTES.POOL_DETAILS);
      props.setActivePage(ROUTES.CONTROL_BOND);
    }  
  };

  return (
    <Card className={"token-card"} onClick={() => selectToken(item)}>
      <div className="token-item">
      {!props.hide ?
        <div className="token-icon center">
          <img
            src={item.imageSource || "img/icons/unsupported.svg"}
            alt="icon"
            onError={(e) => {e.target.src="img/icons/unsupported.svg"}}
          />
        </div>:
        <img
            className="node-item-img"
            src={item.imageSource || "img/icons/unsupported.svg"}
            alt="icon"
            onError={(e) => {e.target.src="img/icons/unsupported.svg"}}
          />
       }
        <div className="token-content">
          <p className="token-name">{item.name}</p>
        </div>
        {!props.hide &&
          <div className="node-amount-block">
              <p>Fee: <span>{item.fee}</span>%</p>
          </div>
        }
      </div>
    </Card>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
  poolReducer: state.poolReducer
});

export default connect(mapStateToProps, {
  setPoolMethod,
  setActivePage,
  setSelectedNode,
  setPreviosPanel,
  prepareSuperfluidDelegate
})(NodeItem);
