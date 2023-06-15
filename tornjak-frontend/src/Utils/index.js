import checkPropTypes from "check-prop-types";
import {applyMiddleware, createStore} from 'redux';
import allReducers from "../../src/redux/reducers"; //import all reducers
import { middlewares } from "../../src/redux/store"

// findByTestId takes in a component and it's testId
// returns compItem - the component
export const findByTestId = (comp, testId) => {
    const compItem = comp.find(`[data-test='${testId}']`);
    return compItem;
}

// checkProps takes in a component and expected props
// returns propsErr after checking the component with the expected props
export const checkProps = (comp, expectedProps) => {
    const propsErr = checkPropTypes(comp.propTypes, expectedProps, 'props', comp.name);
    return propsErr;
}

// testReduxStore takes in initail state
// returns test redux store for testing purposes
export const testReduxStore = (initialState) => {
    const createStoreWithMiddleware = applyMiddleware(...middlewares)(createStore);
    return createStoreWithMiddleware(allReducers, initialState);
}