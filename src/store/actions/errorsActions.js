import {
  GET_ERRORS,
  GET_NETWORK_ERRORS,
  GET_ARGUMENTS_ERRORS,
  GET_VALIDATION_ERRORS,
  GET_IMPLEMENTATION_ERRORS,
} from "./types";
import { setActiveModal } from "./panelActions";
import text from "../../text.json";
import {
  ValidationError,
  NetworkError,
  ImplementationError,
  ArgumentsError,
} from "../../networking/models/Errors";
export const clearErrors = () => (dispatch) => {
  dispatch({
    type: GET_ERRORS,
    payload: null,
  });
  dispatch({
    type: GET_NETWORK_ERRORS,
    payload: null,
  });
};

export const checkErrors = (error) => (dispatch) => {
  if (error instanceof ValidationError) {
    let errorText = {};
    errorText = {
      text: text.ADDRESS_ERROR_TEXT,
      tip: text.ADDRESS_ERROR_TIP,
      header: text.ADDRESS_ERROR_HEADER,
    };
    dispatch({
      type: GET_VALIDATION_ERRORS,
      payload: errorText,
    });
    dispatch(setActiveModal("errors"));
  } else if (error instanceof ArgumentsError) {
    dispatch({
      type: GET_ARGUMENTS_ERRORS,
      payload: error,
    });
  } else if (error instanceof NetworkError) {
    let errorText = {};
    if (error.message?.includes("insufficient funds for transfer")) {
      errorText = {
        text: text.ERROR_TEXT_1,
        description: text.ERROR_DESCRIPTION_1,
        tip: text.ERROR_TIP_1,
      };
    } else if (error.message?.includes("operation is not available")) {
      errorText = {
        text: text.ERROR_TEXT_2,
        description: text.ERROR_DESCRIPTION_2,
        tip: text.ERROR_TIP_2,
      };
    } else if (
      error.message?.includes("INSUFFICIENT_INPUT_AMOUNT") ||
      error.message?.includes("INSUFFICIENT_OUTPUT_AMOUNT")
    ) {
      errorText = {
        text: text.ERROR_TEXT_3,
        description: text.ERROR_DESCRIPTION_3,
        tip: text.ERROR_TIP_3,
      };
    } else {
      errorText = {
        text: text.ERROR_TEXT_DEFAULT,
        description: text.ERROR_DESCRIPTION_DEFAULT,
        tip: text.ERROR_TIP_DEFAULT,
      };
    }
    dispatch({
      type: GET_NETWORK_ERRORS,
      payload: errorText,
    });
    dispatch(setActiveModal("errors"));
  } else if (error instanceof ImplementationError) {
    dispatch({
      type: GET_IMPLEMENTATION_ERRORS,
      payload: error,
    });
  } else {
    dispatch({
      type: GET_ERRORS,
      payload: error,
    });
  }
};
