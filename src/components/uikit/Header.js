import "../styles/components/header.css";
import { Config } from "../../config/config";
import { Icon24Back } from "@vkontakte/icons";
import { connect } from "react-redux";
import { setActivePage } from "../../store/actions/panelActions";
const Header = (props) => {
  const config = new Config();
  const { previousPanel } = props.panelReducer;
  let panel = props.openPools ? "home" : previousPanel;
  if (
    ["settings", "transactions", "pools", "swap", "assets"].includes(
      previousPanel
    )
  ) {
    panel = "home";
  }
  if(previousPanel == 'control_bond' && props.backPanel == 'pool_details'){
    panel = props.backPanel;
  }
  return (
    <div
      className="header"
      style={{ background: config.headerParamsFromConfig("BACKGROUND_COLOR") }}
    >
      <div className="header-line"></div>
      {props.title ? (
        <div className="header-row">
          {props.back && (
            <div
              className="header-back-row"
              onClick={() => {props.setActivePage(panel)}}
            >
              <Icon24Back fill="#818C99" />
              {config.headerParamsFromConfig("BACK_TITLE")}
            </div>
          )}
          <p>{props.title}</p>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
});

export default connect(mapStateToProps, { setActivePage })(Header);
