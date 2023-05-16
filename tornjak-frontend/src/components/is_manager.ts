import {env} from '../env';

// Is Manager
console.log("IS_MANAGER:" + env.REACT_APP_TORNJAK_MANAGER)
const IsManager = env.REACT_APP_TORNJAK_MANAGER !== undefined && env.REACT_APP_TORNJAK_MANAGER.toUpperCase() !== "FALSE"

export default IsManager
