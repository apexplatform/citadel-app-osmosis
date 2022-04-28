import { Group, Div } from "@vkontakte/vkui";
import Header from "../uikit/Header";
import { connect } from "react-redux";
import "../styles/panels/deposit.css";
import text from "../../text.json";
const DepositWithdraw = (props) => {
  return (
    <Group className="deposit-container">
      <Header title={text.DEPOSIT_TITLE}/>
      {
          text.DEPOSIT_CARD.map((card,i) => (
            <Div className="deposit-card" key={i}>
                {i == 0 ? <h3>1. Go to the <span>"Send"</span> section</h3>: i == 1 ? <h3>2. Switch the <span>toggle</span></h3> :<h3>{card.DEPOSIT_CARD_TITLE}</h3>}
                <p>{card.DEPOSIT_CARD_DESCRIPTION}</p>
                <img src={`img/screens/img-${i}.svg`} />
            </Div>
          ))
      }
    </Group>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, {})(DepositWithdraw);
