import { toast, ToastOptions } from "react-toastify"
import { ToastNotification } from "carbon-components-react"

const options: ToastOptions = {
    autoClose: false, 
    closeButton: false, 
    role: "error"
}

export const displayError = (caption: string, title: string = "Error", consoleMsg?: any) => {
    toast(<ToastNotification title={title} caption={caption}/>, options)
    console.log(consoleMsg === undefined ? "ERROR: " + caption : consoleMsg)
}

export const displayResponseError = (caption: string, err: {response: {data: string, status: number}}) => {
    if (!err.response) return
    console.log("Error: " + caption)
    displayError(err.response.data, "Error " + String(err.response.status), err.response)
}