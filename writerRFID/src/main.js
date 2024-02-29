const electronApp = require('electron').app;
const electronBrowserWindow = require('electron').BrowserWindow;
const electronIpcMain = require('electron').ipcMain;
const Store = require('electron-store');
const store = new Store();
const path = require('path');
const { sendCmd } = require('./connection_rfid.js');
const firestore = require('./connection_firestore.js');
const { addDoc, updateDoc, deleteDoc, collection, query, where, getDocs } = require('firebase/firestore');


//Read RFID
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
  window.loadFile(path.join(__dirname, 'views/index.html'));
  window.webContents.openDevTools();
};

const dashboardRegister = () => {
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
      devTools: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  window.loadFile(path.join(__dirname, 'views/register.html'));
  window.webContents.openDevTools();
};

const createWindow = () => {
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

  loginWindow.loadFile(path.join(__dirname, 'views/login.html'));
};


electronApp.on('ready', createWindow);

if (require('electron-squirrel-startup')) {
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

// Login
electronIpcMain.on('login', async (event, data) => {
  try {
    await validateLogin(data);
  } catch (error) {
    console.error(error);
  }
});

async function validateLogin(data) {
  const { email, password } = data;
  const adminRef = collection(firestore, 'Admin');

  try {
    const querySnapshot = await getDocs(query(adminRef, where('email', '==', email), where('password', '==', password)));

    if (!querySnapshot.empty) {
      const adminData = querySnapshot.docs[0].data();

      store.set('email', adminData.email);
      store.set('permissions', adminData.permissions);
      store.set('name', adminData.nama_admin);
      store.set('image', adminData.profile);

      createWindowDashboard();
      window.loadFile(path.join(__dirname, 'views/create_scan.html'));
      window.maximize();
      window.show();
      loginWindow.close();
    }
  } catch (error) {
    console.error('Error querying Firestore:', error);
  }
}

// logout
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

// Load User
electronIpcMain.handle('getUserData', (event) => {
  const data = { user: store.get('user'), email: store.get('email'), permissions: store.get('permissions'), image: store.get('image'), name: store.get('name') };

  return data;
});

// Update & Form Modificar
electronIpcMain.on('consultBook', async (event, RFID) => {
  try {
    const q = query(collection(firestore, 'Pegawai'), where('id_pegawai', '==', RFID));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      const result = querySnapshot.docs[0].data();
      store.set('rfidL', result.RFID);
      store.set('namaL', result.nama);
      store.set('id_pegawaiL', result.id_pegawai);
      store.set('jabatanL', result.jabatan);
      store.set('departemenL', result.departemen);
      store.set('suratL', result.surat);
      store.set('no_hpL', result.no_hp);
      store.set('aksesL', result.akses);
    } else {
      console.log('Tidak ada data ditemukan untuk RFID yang diberikan:', RFID);
    }
  } catch (error) {
    console.error('Error querying Firestore:', error);
  }
});

electronIpcMain.handle('getBook', (event) => {
  const data = {
    rfid: store.get('rfidL'),
    id_pegawai: store.get('id_pegawaiL'),
    nama: store.get('namaL'),
    jabatan: store.get('jabatanL'),
    departemen: store.get('departemenL'),
    surat: store.get('suratL'),
    no_hp: store.get('no_hpL'),
    akses: store.get('aksesL')
  };
  return data;
});


electronIpcMain.handle('getBooks', async (event) => {
  const pegawaiRef = collection(firestore, 'Pegawai');

  try {
    const querySnapshot = await getDocs(pegawaiRef);
    let rfid = '', id_pegawai = '', nama = '', jabatan = '', departemen = '', surat = '', no_hp = '', akses = '';

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      rfid += data.RFID + '_';
      nama += data.nama + '_';
      id_pegawai += data.id_pegawai + '_';
      jabatan += data.jabatan + '_';
      departemen += data.departemen + '_';
      surat += data.surat + '_';
      no_hp += data.no_hp + '_';
      akses += data.akses + '_';
    });

    store.set('rfid', rfid);
    store.set('nama', nama);
    store.set('id_pegawai', id_pegawai);
    store.set('jabatan', jabatan);
    store.set('departemen', departemen);
    store.set('surat', surat);
    store.set('no_hp', no_hp);
    store.set('akses', akses);

    const result = {
      rfid: store.get('rfid'),
      id_pegawai: store.get('id_pegawai'),
      nama: store.get('nama'),
      jabatan: store.get('jabatan'),
      departemen: store.get('departemen'),
      surat: store.get('surat'),
      no_hp: store.get('no_hp'),
      akses: store.get('akses')
    };

    return result;
  } catch (error) {
    console.error('Error querying Firestore:', error);
    return {};
  }
});


//add
electronIpcMain.handle('confirmAddBook', (event) => {
  return store.get('confirmAdd');
});

electronIpcMain.on('addBook', async (event, data) => {
  try {
    await addDB(data);
  } catch (error) {
    console.error(error);
  }
});

async function addDB(data) {
  const { rfid, id_pegawai, nama, jabatan, departemen, surat, no_hp, akses } = data;
  const pegawaiRef = collection(firestore, 'Pegawai');

  try {
    await addDoc(pegawaiRef, {
      RFID: rfid,
      id_pegawai: id_pegawai,
      nama: nama,
      jabatan: jabatan,
      departemen: departemen,
      surat: surat,
      no_hp: no_hp,
      akses: akses
    });

    store.set('confirmAdd', 1);
  } catch (error) {
    console.error('Error adding document to Firestore:', error);
    store.set('confirmAdd', 0);
  }
}
/// register baru

electronIpcMain.handle('konfirmasiAddUser', (event) => {
  return store.get('KonfirmasiTambah');
});

electronIpcMain.on('TambahUser', async (event, data) => {
  try {
    await TambahDB(data);
  } catch (error) {
    console.error(error);
  }
});

async function TambahDB(data) {
  const { nama_admin, email, permissions, password, profile } = data;
  const adminRef = collection(firestore, 'Admin');

  try {
    await addDoc(adminRef, {
      nama_admin: nama_admin,
      email: email,
      permissions: permissions,
      password: password,
      profile: profile
    });

    // If the above operation is successful, set the confirmation flag to 1
    store.set('KonfirmasiTambah', 1);
  } catch (error) {
    console.error('Error adding document to Firestore:', error);

    // If there is an error, set the confirmation flag to 0
    store.set('KonfirmasiTambah', 0);
    throw error; // Propagate the error to the calling function
  }
}

// Update data
electronIpcMain.handle('confirmUpdateBook', (event) => {
  return store.get('confirmUpdate');
});

electronIpcMain.on('updateBook', async (event, data) => {
  try {
    await updateDB(data);
  } catch (error) {
    console.error(error);
  }
});

async function updateDB(data) {
  const { rfid, akses, jabatan, departemen, surat, no_hp, id_pegawai, nama } = data;
  const pegawaiRef = collection(firestore, 'Pegawai');
  const querySnapshot = await getDocs(query(pegawaiRef, where('RFID', '==', rfid)));

  if (!querySnapshot.empty) {
    try {
      const docRef = querySnapshot.docs[0].ref;
      await updateDoc(docRef, {
        akses: akses,
        nama: nama,
        id_pegawai: id_pegawai,
        jabatan: jabatan,
        departemen: departemen,
        surat: surat,
        no_hp: no_hp
      });

      store.set('confirmUpdate', 1);
    } catch (error) {
      console.error('Error updating document in Firestore:', error);
      store.set('confirmUpdate', 0);
    }
  }
}

// Delete data
electronIpcMain.handle('confirmDeleteBook', (event) => {
  return store.get('confirmDelete');
});

electronIpcMain.on('deleteBook', async (event, RFID) => {
  try {
    await deleteDB(RFID);
  } catch (error) {
    console.error(error);
  }
});

async function deleteDB(RFID) {
  const pegawaiRef = collection(firestore, 'Pegawai');
  const querySnapshot = await getDocs(query(pegawaiRef, where('RFID', '==', RFID)));

  if (!querySnapshot.empty) {
    try {
      const docRef = querySnapshot.docs[0].ref;
      await deleteDoc(docRef);

      store.set('confirmDelete', 1);
    } catch (error) {
      console.error('Error deleting document in Firestore:', error);
      store.set('confirmDelete', 0);
    }
  }
}
