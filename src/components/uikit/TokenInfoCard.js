import { Div, Avatar } from "@vkontakte/vkui";
const TokenInfoCard = (props) => {
  const item = props.item;
  return (
    <Div className="pool-third-item">
      <div>
        <Avatar size={32} className="token-logo" src={item.token.logoURI} />
        <div className="pool-third-column-1">
          <span>Token</span>
          <p>{item.token.code}</p>
        </div>
      </div>
      <div className="pool-third-column-2">
        <div>
          <div className="error-text-div">
            <h2>{item.amount} </h2>
            <span> {item.token.code}</span>
          </div>
          <p>
            {item.percent} <span> {props.symbol}</span>
          </p>
        </div>
      </div>
    </Div>
  );
};

export default TokenInfoCard;
