let txtRFID = document.querySelector('#txtRFID');
let txtId_Pegawai = document.querySelector('#txtId_Pegawai');
let txtNama = document.querySelector('#txtNama');
let txtJabatan = document.querySelector('#txtJabatan');
let txtDepartemen = document.querySelector('#txtDepartemen');
let txtMail = document.querySelector('#txtMail');
let txtNo_Hp = document.querySelector('#txtNo_Hp');
let txtAkses = document.querySelector('#txtAkses');

let btnWrite = document.querySelector('#btnWrite');
let btnCreate = document.querySelector('#btnCreate');

txtNama.focus();

// write UHF RFID
const getRandomHexString = (length) => {
    const characters = '0123456789ABCDEF';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result.match(/.{1,2}/g).join(' '); // Memastikan ada spasi setiap 2 karakter
};

const write_rfidResult = async () => {
    const selectedCmd = txtAkses.value;
    let cmd;
    let randomValue;
    switch (selectedCmd) {
        case '1':
            randomValue = getRandomHexString(8);
            cmd = '0F 99 04 03 00 00 00 00 D1 11 ' + randomValue;
            break;
        case '2':
            randomValue = getRandomHexString(8);
            cmd = '0F 99 04 03 00 00 00 00 D2 22 ' + randomValue;
            break;
        case '3':
            randomValue = getRandomHexString(8);
            cmd = '0F 99 04 03 00 00 00 00 D3 33 ' + randomValue;
            break;
        case '4':
            randomValue = getRandomHexString(8);
            cmd = '0F 99 04 03 00 00 00 00 D4 44 ' + randomValue;
            break;
        default:
            console.error('Invalid command:', selectedCmd);
            return;
    }

    try {
        await window.ipcRender.invoke('writeRfid', cmd);
    } catch (error) {
        console.error('Error in write_rfidResult:', error);
        throw error; // Propagate the error
    }
};

// Fungsi untuk membaca RFID
const read_rfidResult = async () => {
    try {
        const result = await window.ipcRender.invoke('readRfid');
        console.log('Hasil RFID:', result);
        txtRFID.value = result;
    } catch (error) {
        console.error('Error in read_rfidResult:', error);
        throw error; // Propagate the error
    }
};


// Event listener untuk menulis RFID
document.getElementById('btnWrite').addEventListener('click', async function () {
    // Memanggil fungsi untuk menghasilkan kode acak
    const randomCode = generateRandomCode();
    inputRandomCode.value = randomCode;

    try {
        // Memanggil fungsi untuk membaca RFID

        await write_rfidResult();
        const inputGroupSuccessIcon = document.getElementById('inputGroupSuccessIcon');
        inputGroupSuccessIcon.style.display = 'inline';

        await read_rfidResult();
        // Menyembunyikan icon setelah 3 detik
        setTimeout(() => {
            inputGroupSuccessIcon.style.display = 'none';
        }, 3000);

        // Optional: Menambahkan keterangan tambahan
    } catch (error) {
        console.error('Error:', error);
    }
});


// Fungsi untuk menghasilkan kode acak
function generateRandomCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'; // karakter yang diizinkan
    const codeLength = 6; // panjang kode yang diinginkan

    let randomCode = '';
    for (let i = 0; i < codeLength; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomCode += characters.charAt(randomIndex);
    }

    return randomCode;
}

// Button Create
btnCreate.addEventListener('click', () => {
    if (!(txtRFID.value == '' || txtNama.value == '' || txtId_Pegawai.value == '' || txtJabatan.value == '' || txtDepartemen.value == '' || txtMail.value == '' || txtNo_Hp.value == '' || txtAkses.value == '')) {
        let data = { rfid: txtRFID.value, nama: txtNama.value, id_pegawai: txtId_Pegawai.value, jabatan: txtJabatan.value, departemen: txtDepartemen.value, surat: txtMail.value, no_hp: txtNo_Hp.value, akses: txtAkses.value };
        addBook(data);
    }
});

const addBook = (data) => {
    window.ipcRender.send('addBook', data);
    localStorage.setItem('reload', '1');
    location.reload();
}

if (localStorage.getItem('reload') == '1') {
    localStorage.removeItem('reload');

    window.ipcRender.invoke('confirmAddBook').then((confirm) => {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger mr-2'
            },
            buttonsStyling: false,
            allowEscapeKey: false,
            allowOutsideClick: false
        });

        if (confirm == 1) {
            swalWithBootstrapButtons.fire({
                title: 'Ditambahkan!',
                text: "Pendaftaran ditambahkan",
                icon: 'success',
                confirmButtonClass: 'mr-2'
            }).then((result) => {
                if (result.value) {
                    // Redirect to create.html after the user clicks 'OK' on the confirmation
                    window.location.href = 'create_scan.html';
                }
            });
        } else if (confirm == 0) {
            swalWithBootstrapButtons.fire({
                title: 'Gagal!',
                text: "Catatan baru tidak dapat ditambahkan ke database.",
                icon: 'error',
                confirmButtonClass: 'mr-2'
            }).then((result) => {
                if (result.value) {
                    // Redirect to create.html after the user clicks 'OK' on the confirmation
                    window.location.href = 'create_scan.html';
                }
            });
        }
    });
}

const showUsers = (libros) => {
    let tableUsers = document.querySelector('#tabla-libros');
    let texto = '';

    tableUsers.innerHTML = '';

    for (let i = 0; i < libros.length; i++) {
        texto +=
            `
            <tr>
                <td>${libros[i].rfid}</td>
                <td>${libros[i].nama}</td>
                <td>${libros[i].id_pegawai}</td>
                <td>${libros[i].jabatan}</td>
                <td>${libros[i].departemen}</td>
                <td>${libros[i].surat}</td>
                <td>${libros[i].no_hp}</td>
                <td>${libros[i].akses}</td>
                <td class="text-center"><button type="button" class="btn btn-danger" onclick="showSwal('passing-parameter-execute-cancel', '${libros[i].rfid}')">Hapus</button></td>
            </tr>
        `;
    }

    tableUsers.innerHTML = texto;
}

const consultBooks = () => {
    window.ipcRender.invoke('getBooks').then((result) => {
        let { rfid, akses, jabatan, departemen, surat, no_hp, nama, id_pegawai } = result;

        rfid = rfid.replace(/(^_)|(_$)/g, '');
        nama = nama.replace(/(^_)|(_$)/g, '');
        id_pegawai = id_pegawai.replace(/(^_)|(_$)/g, '');
        jabatan = jabatan.replace(/(^_)|(_$)/g, '');
        departemen = departemen.replace(/(^_)|(_$)/g, '');
        surat = surat.replace(/(^_)|(_$)/g, '');
        no_hp = no_hp.replace(/(^_)|(_$)/g, '');
        akses = akses.replace(/(^_)|(_$)/g, '');

        rfid = rfid.split('_');
        nama = nama.split('_');
        id_pegawai = id_pegawai.split('_');
        jabatan = jabatan.split('_');
        departemen = departemen.split('_');
        surat = surat.split('_');
        no_hp = no_hp.split('_');
        akses = akses.split('_');

        let libros = [];

        for (let i = 0; i < rfid.length; i++) {
            libros.push({
                'rfid': rfid[i],
                'nama': nama[i],
                'id_pegawai': id_pegawai[i],
                'jabatan': jabatan[i],
                'departemen': departemen[i],
                'surat': surat[i],
                'no_hp': no_hp[i],
                'akses': akses[i],
            });
        }

        showUsers(libros);
    });
}

function capitalizeFirstLetter(input) {
    var inputValue = input.value;
    inputValue = inputValue.toLowerCase().replace(/\b\w/g, function (firstLetter) {
        return firstLetter.toUpperCase();
    });
    input.value = inputValue;
}


const formSubmit = (event) => {
    event.preventDefault();
    return false;
}

