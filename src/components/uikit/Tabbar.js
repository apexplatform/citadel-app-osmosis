import "../styles/components/tabbar.css";
import { connect } from "react-redux";
import { Config } from "../../config/config";
import TabbarItem from "./TabbarItem";
import ROUTES from "../../routes";
const Tabbar = () => {
  const config = new Config();
  return (
    <div
      className="tabbar"
      style={{ background: config.tabbarParamsFromConfig("BACKGROUND_COLOR") }}
    >
      {config.tabbarParamsFromConfig("TABBAR_ITEMS").map((item) => (
        <TabbarItem
          key={item.TITLE}
          icon={item.ICON}
          title={item.TITLE}
          routes={item.ROUTES}
        />
      ))}
      <TabbarItem
        title={"Transactions"}
        icon="transaction"
        routes={ROUTES.TRANSACTIONS}
      />
      <TabbarItem title={"Settings"} icon="settings" routes={ROUTES.SETTINGS} />
    </div>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
});

export default connect(mapStateToProps, {})(Tabbar);
