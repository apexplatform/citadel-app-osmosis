import { useState } from "react";
import { Group, Div } from "@vkontakte/vkui";
import StepsHeader from "../uikit/StepsHeader";
import { connect } from "react-redux";
import "../styles/panels/create-pool.css";
import text from "../../text.json";
import { setActivePage } from "../../store/actions/panelActions";
import FirstStepPanel from "../panels/FirstStepPanel";
import SecondStepPanel from "../panels/SecondStepPanel";
import ThirdStepPanel from "../panels/ThirdStepPanel";
const CreatePool = (props) => {
  const [activeOption, setActiveOption] = useState(1);
  return (
    <Group className="create-pool-block">
      <StepsHeader
        activeOption={activeOption}
        setActiveOption={setActiveOption}
      />
      <Div className="pool-fee-div">
        <h3>{text.POOL_CREATION_FEE}</h3>
        <div className="pool-fee-row">
          <p>{text.POOL_CREATION_FEE_DESCRIPTION}</p>
          <h2>
            100<span className="grey-text"> OSMO</span>
          </h2>
        </div>
      </Div>
      {activeOption == 1 && (
        <FirstStepPanel setActiveOption={setActiveOption} />
      )}
      {activeOption == 2 && (
        <SecondStepPanel setActiveOption={setActiveOption} />
      )}
      {activeOption == 3 && <ThirdStepPanel />}
    </Group>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
  poolReducer: state.poolReducer,
});

export default connect(mapStateToProps, { setActivePage })(CreatePool);
