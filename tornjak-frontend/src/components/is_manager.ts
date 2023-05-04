// Is Manager
console.log("IS_MANAGER:" + process.env.REACT_APP_TORNJAK_MANAGER)
const IsManager = process.env.REACT_APP_TORNJAK_MANAGER !== undefined && process.env.REACT_APP_TORNJAK_MANAGER.toUpperCase() !== "FALSE"

export default IsManager
