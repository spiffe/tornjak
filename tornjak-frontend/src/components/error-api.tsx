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

type Response = {response: {data: string, status: number}}

const defaultResponseProps = (res: Response): NotificationProps => {
    if (res.response === undefined) {
        return {caption: "Could not connect to backend", title: "Network Error"}
    }
    return {caption: res.response.data, title: "Error " + String(res.response.status)}
}

export const showResponseToast = (res: Response, props?: NotificationProps, options?: ToastOptions): void => {
    showToast({...defaultResponseProps(res), ...props}, options)
}