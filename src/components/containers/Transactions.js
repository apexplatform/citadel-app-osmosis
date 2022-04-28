import { Card, Group } from "@vkontakte/vkui";
import TransactionItem from "../uikit/TransactionItem";
import ROUTES from "../../routes";
import {
  setSelectedTransaction,
  loadTransactions,
} from "../../store/actions/transactionsActions";
import { setActivePage } from "../../store/actions/panelActions";
import { connect } from "react-redux";
import Header from "../uikit/Header";
import Loader from "../uikit/Loader";
import text from "../../text.json";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
const Transactions = (props) => {
  const { transactions, hasmoreTransactions } = props.transactionsReducer;
  const { loader } = props.panelReducer;
  const setTransaction = (item) => {
    props.setActivePage(ROUTES.TRANSACTION_DETAILS);
    props.setSelectedTransaction(item);
  };
  const [page, setPage] = useState(1);
  return (
    <Group>
      <div className="fixed-header">
        <Header title="Transactions" showTitle={true} />
      </div>
      {loader ? (
        transactions?.length ? (
          <InfiniteScroll
            className="transactions-grid"
            dataLength={transactions?.length}
            next={() => {
              props.loadTransactions(10, page * 10);
              setPage(page + 1);
            }}
            hasMore={hasmoreTransactions}
            loader={<Loader id="centered-loader" />}
          >
            {transactions.map((item, i) => (
              <Card
                className="transactions-card"
                size="l"
                mode="outline"
                key={i}
                onClick={() => setTransaction(item)}
              >
                <TransactionItem data={item} />
              </Card>
            ))}
          </InfiniteScroll>
        ) : (
          <div className="no-transactions-block">
            <img src="img/icons/noTransactions.svg" alt="empty" />
            <h3>{text.NO_TRANSACTIONS}</h3>
            <p>{text.NO_TRANSACTIONS_DESCRIPTION}</p>
          </div>
        )
      ) : (
        <Loader id="centered-loader" />
      )}
    </Group>
  );
};

const mapStateToProps = (state) => ({
  panelReducer: state.panelReducer,
  transactionsReducer: state.transactionsReducer,
});

export default connect(mapStateToProps, {
  loadTransactions,
  setSelectedTransaction,
  setActivePage,
})(Transactions);
