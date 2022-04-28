import {
  GET_ERRORS,
  GET_NETWORK_ERRORS,
  GET_ARGUMENTS_ERRORS,
  GET_VALIDATION_ERRORS,
  GET_IMPLEMENTATION_ERRORS,
} from "../actions/types";

const initialState = {
  errors: null,
  networkErrors: null,
  validationErrors: null,
  implementationErrors: null,
  argumentsError: null,
};
export default function (state = initialState, action) {
  switch (action.type) {
    case GET_ERRORS:
      return {
        ...state,
        errors: action.payload,
      };
    case GET_NETWORK_ERRORS:
      return {
        ...state,
        networkErrors: action.payload,
      };
    case GET_ARGUMENTS_ERRORS:
      return {
        ...state,
        argumentsError: action.payload,
      };
    case GET_VALIDATION_ERRORS:
      return {
        ...state,
        validationErrors: action.payload,
      };
    case GET_IMPLEMENTATION_ERRORS:
      return {
        ...state,
        implementationErrors: action.payload,
      };
    default:
      return state;
  }
}
