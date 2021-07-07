import { alertConstants } from '../_constants';
import {notification} from "antd";

export const alertActions = {
    success,
    error,
    clear
};

function success(title, message) {
    notification.success({
        placement: 'topRight',
        message: title,
        description: message,
    });
    return { type: alertConstants.SUCCESS, message };
}

function error(title, message) {
    notification.error({
        placement: 'topRight',
        message: title,
        description: message,
    });
    return { type: alertConstants.ERROR, message };
}

function clear() {
    return { type: alertConstants.CLEAR };
}