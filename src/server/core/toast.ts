import io from 'socket.io'
import { SocketEvents, ToastSeverity } from '../../common/constants';



export function sendToast(socket: io.Socket, message: string, severity: ToastSeverity) {
    socket.emit(SocketEvents.TOAST, message, severity)
}