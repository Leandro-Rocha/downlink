import { Gui } from "./types";

export const ROOT = 'root'

export enum socketEvents {
    GOD_MODE = 'GOD_MODE',
    CONNECT = 'connect',

    RESET_DATA = 'RESET_DATA',
    REGISTER_USER = 'REGISTER_USER',

    UPDATE_STATE = 'UPDATE_STATE',
    ERROR = 'ERROR',
    PLAYER_CONNECT = 'PLAYER_CONNECT',

    PLAYER_ACTION = 'PLAYER_ACTION'
}

export enum PlayerActions {
    CONNECT_TO_GATEWAY = 'CONNECT_TO_GATEWAY',
    LOGIN = 'LOGIN',
    EXECUTE_SOFTWARE = 'EXECUTE_SOFTWARE',
}

export enum ConnectionStatus {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTED = 'CONNECTED',
    LOGGED = 'LOGGED',
}

export enum ProcessStatus {
    NEW = 'NEW',
    RUNNING = 'RUNNING',
    FINISHED = 'FINISHED',
    DEAD = 'DEAD'
}

export enum AccessPrivileges {
    CONNECT = 'CONNECT',
    LOG = 'LOG',
    FTP = 'FTP',
    SSH = 'SSH',
    ROOT = 'ROOT',
}

export enum ResourceTypes {
    DOWNLINK = 'DOWNLINK',
    UPLINK = 'UPLINK',
    MEMORY = 'MEMORY',
    CPU = 'CPU',
    STORAGE = 'STORAGE',
}

