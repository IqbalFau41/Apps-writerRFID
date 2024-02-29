let btnRead = document.querySelector('#btnRead');
let btnRefresh = document.querySelector('#btnRefresh');

// Refresh
const refreshPage = () => {
    location.reload();
}
btnRefresh.addEventListener('click', refreshPage);

// Fungsi untuk membuka halaman create_form
const openCreateFormPage = () => {
    var urlHalamanCreate = 'create_form.html';
    window.location.href = urlHalamanCreate;
}

// Fungsi untuk membaca RFID
const read_rfidResult = () => {
    const errorMessageElement = document.getElementById('errorMessage');
    const rfidResultMessageElement = document.getElementById('rfidResultMessage');

    window.ipcRender.invoke('readRfid').then((result) => {
        console.log('Scan:', result);

        if (result !== '0' && result.trim() !== '') {
            openCreateFormPage();
            errorMessageElement.innerText = '';
            rfidResultMessageElement.innerText = 'Berhasil.';
        } else {
            alert('RFID tidak terdeteksi, coba ulangi kembali.');
            errorMessageElement.innerText = 'RFID tidak terdeteksi, coba ulangi kembali.';
            rfidResultMessageElement.innerText = '';
        }
    }).catch((error) => {
        console.error('Error:', error);
    });
}

btnRead.addEventListener('click', read_rfidResult);
