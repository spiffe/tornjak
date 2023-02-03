import { toast } from "react-toastify"
import { ToastNotification } from "carbon-components-react"

export const displayError = (caption: string, title: string = "Error", consoleMsg?: any) => {
    toast(<ToastNotification title={title} caption={caption} />, {autoClose: false, closeButton: false})
    console.log(consoleMsg === undefined ? "ERROR: " + caption : consoleMsg)
}

export const displayResponseError = (caption: string, err: {response: {data: string, status: number}}) => {
    console.log("Error: " + caption)
    displayError(err.response.data, "Error " + String(err.response.status), err.response)
}