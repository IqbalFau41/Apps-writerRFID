const contextBridge = require('electron').contextBridge;
const ipcRender = require('electron').ipcRenderer;

const ipc = {
    'render': {
        'send': [
            'login',
            'logout',
            'page_login',
            'page_register',
            'addBook',
            'TambahUser',
            'updateBook',
            'deleteBook',
            'consultBook',
        ],
        'sendReceive': [
            'getUserData',
            'getBooks',
            'getBook',
            'confirmAddBook',
            'konfirmasiAddUser',
            'confirmUpdateBook',
            'confirmDeleteBook',
            'readRfid',
            'writeRfid',
        ]
    }
};

contextBridge.exposeInMainWorld(
    'ipcRender', {
    send: (channel, args) => {
        let validChannels = ipc.render.send;

        if (validChannels.includes(channel)) {
            ipcRender.send(channel, args);
        }
    },
    invoke: (channel, args) => {
        let validChannels = ipc.render.sendReceive;

        if (validChannels.includes(channel)) {
            return ipcRender.invoke(channel, args);
        }
    }
});