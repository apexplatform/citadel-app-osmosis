const StepsBlock = (props) => {
    const getStatusId = (id) => {
        if (props.activeOption > id) {
          return "passed-step";
        } else if (props.activeOption === id) {
          return "active-step";
        } else {
          return undefined;
        }
      };
      const changeStep = (step) => {
        props.setActiveOption(step);
      };
    return (
        <div className='pool-step-block'>
            <div className='pool-step-row'>
                <span className={getStatusId(1)}></span>
                <hr/>
                <span className={getStatusId(2)}></span>
                <hr/>
                <span className={getStatusId(3)}></span>
            </div>
            <div className='pool-step-row pool-steps-numbers'>
                <p className={getStatusId(1)} onClick={() => changeStep(1)}>1</p>
                <p className={getStatusId(2)} onClick={() => changeStep(2)}>2</p>
                <p className={getStatusId(3)} onClick={() => changeStep(3)}>3</p>
            </div>
        </div>
    )
}

export default StepsBlock;