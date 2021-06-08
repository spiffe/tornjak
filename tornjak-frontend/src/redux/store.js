//---redux--------------------------------------
import {applyMiddleware, createStore} from 'redux';
import allReducers from './reducers'; //import all reducers
import thunk from "redux-thunk";
import { composeWithDevTools } from 'redux-devtools-extension'; //for Redox dev

function saveToLocalStorage(state) {
    try {
        const serializedState = JSON.stringify(state)
        sessionStorage.setItem('state', serializedState)
    } catch(e) {
        console.log(e)
    }
}

function loadFromLocalStorage() {
    try {
        const serializedState = sessionStorage.getItem('state')
        if (serializedState === null) return undefined
        return JSON.parse(serializedState)
    } catch(e) {
        console.log(e)
        return undefined
    }
}

const persistedState = loadFromLocalStorage()
// STORE -> Globalized state - where to store all data
const store = createStore(
    allReducers, 
    persistedState,
    //applyMiddleware(thunk)
    composeWithDevTools(applyMiddleware(thunk)) //for redux devtools extension for dev
  ); //store all combined reducers in one
  //--------------------------------------------

  store.subscribe(() => saveToLocalStorage(store.getState()))
  export default store;