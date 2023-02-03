import { toast } from "react-toastify"
import { ToastNotification } from "carbon-components-react"

export const displayError = (caption: string, title: string = "Error", consoleMsg?: any) => {
    toast(<ToastNotification title={title} caption={caption} />, {autoClose: false, closeButton: false})
    console.log(consoleMsg === undefined ? "ERROR: " + caption : consoleMsg)
}

export const displayResponseError = (err: {response: {data: string, status: number}}) => {
    const caption = "Error " + String(err.response.status)
    console.log(caption)
    displayError(err.response.data, caption, err.response)
}