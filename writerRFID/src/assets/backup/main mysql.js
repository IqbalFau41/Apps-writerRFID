const electronApp = require('electron').app;
const electronBrowserWindow = require('electron').BrowserWindow;
const electronIpcMain = require('electron').ipcMain;
const Store = require('electron-store');
const store = new Store();
const path = require('path');
const db = require('../../connection_local.js');
const { sendCmd } = require('../../connection_rfid.js');

electronIpcMain.handle('readRfid', async (event) => {
  try {
    const result = await read_receiveCmd();
    event.sender.send('readRfid', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
});

async function read_receiveCmd() {
  return await sendCmd('04 FF 0F');
}

//write RFID
electronIpcMain.handle('writeRfid', async (event, cmd) => {
  try {
    const result = await write_receiveCmd(cmd);
    event.sender.send('writeRfid', result);
    return result;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
});

async function write_receiveCmd(cmd) {
  return await sendCmd(cmd);
}

let window;
let loginWindow;

const createWindowDashboard = () => {
  // Create the browser window.
  window = new electronBrowserWindow({
    icon: __dirname + '/assets/images/favicon.ico',
    width: 900,
    height: 600,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      devTools: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  window.loadFile(path.join(__dirname, 'views/index.html'));

  window.webContents.openDevTools();
};

const dashboardRegister = () => {
  // Create the browser window.
  window = new electronBrowserWindow({
    icon: __dirname + '/assets/images/favicon.ico',
    width: 600,
    height: 600,
    resizable: true,
    maximizable: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      devTools: false,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  window.loadFile(path.join(__dirname, 'views/register.html'));

  window.webContents.openDevTools();
};

const createWindow = () => {
  // Create the browser window.
  loginWindow = new electronBrowserWindow({
    icon: __dirname + '/assets/images/favicon.ico',
    width: 500,
    height: 470,
    resizable: false,
    maximizable: false,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      devTools: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // and load the index.html of the app.
  loginWindow.loadFile(path.join(__dirname, 'views/login.html'));
};


electronApp.on('ready', createWindow);

if (require('electron-squirrel-startup')) {
  //  eslint-disable-line global-require
  electronApp.quit();
}

electronApp.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    electronApp.quit();
  }
});

electronApp.on('activate', () => {
  if (electronBrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

electronIpcMain.on('login', (event, data) => {
  validateLogin(data);
});

function validateLogin(data) {
  const { email, password } = data;
  const sql = 'SELECT * FROM Admin WHERE email=? AND password=?';

  db.query(sql, [email, password], (error, results, fields) => {
    if (error) {
      console.log(error);
    }

    if (results.length > 0) {
      store.set('email', results[0].email);
      store.set('permissions', results[0].permissions);
      store.set('name', results[0].nama_admin);
      store.set('image', results[0].profile);

      createWindowDashboard();
      window.loadFile(path.join(__dirname, 'views/create_scan.html'));
      window.maximize();
      window.show();
      loginWindow.close();
    }
  });
}

electronIpcMain.on('logout', (event, confirm) => {
  validateLogout(confirm);
});

function validateLogout(confirm) {
  if (confirm == 'confirm-logout') {
    store.delete('user');
    store.delete('email');
    store.delete('permissions');
    store.delete('name');
    store.delete('image');

    store.delete('rfidL');
    store.delete('namaL');
    store.delete('id_pegawaiL');
    store.delete('jabatanL');
    store.delete('departemenL');
    store.delete('suratL');
    store.delete('no_hpL');
    store.delete('aksesL');

    store.delete('confirmAdd');
    store.delete('KonfirmasiTambah');
    store.delete('confirmUpdate');
    store.delete('confirmDelete');

    createWindow();
    loginWindow.show();
    window.close();
  }
}

electronIpcMain.on('invitado', (event, permissions) => {
  store.set('permissions', permissions);

  createWindowDashboard();
  window.show();
  loginWindow.close();
  window.maximize();
});

electronIpcMain.on('page_register', (event, permissions) => {
  store.set('permissions', permissions);

  dashboardRegister();
  window.show();
  loginWindow.close();

});


electronIpcMain.on('page_login', (event, permissions) => {
  store.set('permissions', permissions);

  createWindow();
  window.show();
  window.close();

});

electronIpcMain.handle('getUserData', (event) => {
  const data = { user: store.get('user'), email: store.get('email'), permissions: store.get('permissions'), image: store.get('image'), name: store.get('name') };

  return data;
});
// =============
electronIpcMain.on('consultBook', (event, RFID) => {
  const sql = 'SELECT * FROM Pegawai WHERE RFID=?';

  db.query(sql, RFID, (error, results) => {
    if (error) {
      console.log(error);
    }
    store.set('rfidL', results[0].RFID);
    store.set('namaL', results[0].nama);
    store.set('id_pegawaiL', results[0].id_pegawai);
    store.set('jabatanL', results[0].jabatan);
    store.set('departemenL', results[0].departemen);
    store.set('suratL', results[0].surat);
    store.set('no_hpL', results[0].no_hp);
    store.set('aksesL', results[0].akses);
  });
});

electronIpcMain.handle('getBook', (event) => {
  const data = { rfid: store.get('rfidL'), id_pegawai: store.get('id_pegawaiL'), nama: store.get('namaL'), jabatan: store.get('jabatanL'), departemen: store.get('departemenL'), surat: store.get('suratL'), no_hp: store.get('no_hpL'), akses: store.get('aksesL') };

  return data;
});

electronIpcMain.handle('getBooks', (event) => {
  let rfid = '', id_pegawai = '', nama = '', jabatan = '', departemen = '', surat = '', no_hp = '', akses = '';

  db.query('SELECT * FROM Pegawai', (error, results, fields) => {
    if (error) {
      console.log(error);
    }

    if (results.length > 0) {
      for (let i = 0; i < results.length; i++) {
        rfid += results[i].RFID + '_';
        nama += results[i].nama + '_';
        id_pegawai += results[i].id_pegawai + '_';
        jabatan += results[i].jabatan + '_';
        departemen += results[i].departemen + '_';
        surat += results[i].surat + '_';
        no_hp += results[i].no_hp + '_';
        akses += results[i].akses + '_';
      }

      store.set('rfid', rfid);
      store.set('nama', nama);
      store.set('id_pegawai', id_pegawai);
      store.set('jabatan', jabatan);
      store.set('departemen', departemen);
      store.set('surat', surat);
      store.set('no_hp', no_hp);
      store.set('akses', akses);
    }
  });

  const data = { rfid: store.get('rfid'), id_pegawai: store.get('id_pegawai'), nama: store.get('nama'), jabatan: store.get('jabatan'), departemen: store.get('departemen'), surat: store.get('surat'), no_hp: store.get('no_hp'), akses: store.get('akses') };

  return data;
});

electronIpcMain.handle('confirmAddBook', (event) => {
  return store.get('confirmAdd');
});

electronIpcMain.on('addBook', (event, data) => {
  addDB(data);
});

function addDB(data) {
  const { rfid, id_pegawai, nama, jabatan, departemen, surat, no_hp, akses } = data;
  const sql = 'INSERT INTO Pegawai (rfid, id_pegawai, nama, jabatan, departemen, surat, no_hp, akses) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';

  db.query(sql, [rfid, id_pegawai, nama, jabatan, departemen, surat, no_hp, akses], (error) => {
    if (error) {
      console.log(error);
      store.set('confirmAdd', 0);
    } else {
      store.set('confirmAdd', 1);
    }
  });
}

electronIpcMain.handle('konfirmasiAddUser', (event) => {
  return store.get('KonfirmasiTambah');
});

electronIpcMain.on('TambahUser', (event, data) => {
  TambahDB(data);
});

function TambahDB(data) {
  const { nama_admin, email, permissions, password } = data;
  const sql = 'INSERT INTO Admin (nama_admin, email, permissions, password) VALUES (?, ?, ?, ?)';

  db.query(sql, [nama_admin, email, permissions, password], (error) => {
    if (error) {
      console.log(error);
      store.set('KonfirmasiTambah', 0);
    } else {
      store.set('KonfirmasiTambah', 1);
    }
  });
}

electronIpcMain.handle('confirmUpdateBook', (event) => {
  return store.get('confirmUpdate');
});

electronIpcMain.on('updateBook', (event, data) => {
  updateDB(data);
});

function updateDB(data) {
  const { rfid, akses, jabatan, departemen, surat, no_hp, id_pegawai, nama } = data;
  const sql = 'UPDATE Pegawai SET akses=?,  nama=?, id_pegawai=?, jabatan=?, departemen=?,  surat=?, no_hp=? WHERE RFID=?';

  db.query(sql, [akses, nama, id_pegawai, jabatan, departemen, surat, no_hp, rfid], (error) => {
    if (error) {
      console.log(error);
      store.set('confirmUpdate', 0);
    } else {
      store.set('confirmUpdate', 1);
    }
  });
}

electronIpcMain.handle('confirmDeleteBook', (event) => {
  return store.get('confirmDelete');
});

electronIpcMain.on('deleteBook', (event, RFID) => {
  deleteDB(RFID);
});

function deleteDB(RFID) {
  const sql = 'DELETE FROM Pegawai WHERE RFID = ?';

  db.query(sql, [RFID], (error) => {
    if (error) {
      console.log(error);
      store.set('confirmDelete', 0);
    } else {
      store.set('confirmDelete', 1);
    }
  });
}
