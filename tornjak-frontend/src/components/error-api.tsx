import { toast, ToastContent, ToastOptions } from "react-toastify"
import { ToastNotification, ToastNotificationProps } from "carbon-components-react"

interface NotificationProps extends Omit<ToastNotificationProps, "title"> {
    title?: string
}

const defualtProps: ToastNotificationProps = {title: "Notification", kind: "error"}
const defaultOptions: ToastContent = {autoClose: false, closeButton: false, role: "alert"}

export const showToast = (props?: NotificationProps, options?: ToastOptions): void => {
    const newProps = {...defualtProps, ...props}
    toast(<ToastNotification {...newProps} />, {...defaultOptions, ...options})
}

type Error = {response: {data: string, status: number}}

const defaultResponseProps = (error: Error): NotificationProps => {
    return {caption: error.response.data, title: "Error " + String(error.response.status)}
}

export const showResponseToast = (error: Error, props?: NotificationProps, options?: ToastOptions): void => {
    showToast({...defaultResponseProps(error), ...props}, options)
    console.log("Encountered a backend error...")
    console.log(error.response)
}