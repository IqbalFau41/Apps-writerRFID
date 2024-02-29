let txtRFID = document.querySelector('#txtRFID');
let txtNama = document.querySelector('#txtNama');
let txtId_Pegawai = document.querySelector('#txtId_Pegawai');
let txtJabatan = document.querySelector('#txtJabatan');
let txtDepartemen = document.querySelector('#txtDepartemen');
let txtMail = document.querySelector('#txtMail');
let txtNo_Hp = document.querySelector('#txtNo_Hp');
let txtAkses = document.querySelector('#txtAkses');

const loadBook = () => {
    window.ipcRender.invoke('getBook').then((result) => {
        let { rfid, akses, jabatan, departemen, surat, no_hp, nama, id_pegawai } = result;

        txtRFID.value = rfid;
        txtNama.value = nama;
        txtId_Pegawai.value = id_pegawai;
        txtJabatan.value = jabatan;
        txtDepartemen.value = departemen;
        txtMail.value = surat;
        txtNo_Hp.value = no_hp;
        txtAkses.value = akses;


        txtNama.focus();
    });
}

loadBook();

let btnCancelar = document.querySelector('#btnCancelar');
let btnActualizar = document.querySelector('#btnActualizar');

btnCancelar.addEventListener('click', () => {
    location.href = './update.html';
});

btnActualizar.addEventListener('click', () => {
    if (!(txtRFID.value == '' || txtNama.value == '' || txtId_Pegawai.value == '' || txtJabatan.value == '' || txtDepartemen.value == '' || txtMail.value == '' || txtNo_Hp.value == '' || txtAkses.value == '')) {
        let data = { rfid: txtRFID.value, nama: txtNama.value, id_pegawai: txtId_Pegawai.value, jabatan: txtJabatan.value, departemen: txtDepartemen.value, surat: txtMail.value, no_hp: txtNo_Hp.value, akses: txtAkses.value };
        updateBook(data);
    }
});

const updateBook = (data) => {
    window.ipcRender.send('updateBook', data);

    localStorage.setItem('reload', '1');
    localStorage.setItem('txtRFID', txtRFID.value);
    localStorage.setItem('txtNama', txtNama.value);
    localStorage.setItem('txtId_Pegawai', txtId_Pegawai.value);
    localStorage.setItem('txtJabatan', txtJabatan.value);
    localStorage.setItem('txtDepartemen', txtDepartemen.value);
    localStorage.setItem('txtMail', txtMail.value);
    localStorage.setItem('txtNo_Hp', txtNo_Hp.value);
    localStorage.setItem('txtAkses', txtAkses.value);

    location.reload();
}

if (localStorage.getItem('reload') == '1') {
    localStorage.removeItem('reload');

    window.ipcRender.invoke('confirmUpdateBook').then((confirm) => {
        txtRFID.value = localStorage.getItem('txtRFID');
        txtNama.value = localStorage.getItem('txtNama');
        txtId_Pegawai.value = localStorage.getItem('txtId_Pegawai');
        txtJabatan.value = localStorage.getItem('txtJabatan');
        txtDepartemen.value = localStorage.getItem('txtDepartemen');
        txtMail.value = localStorage.getItem('txtMail');
        txtNo_Hp.value = localStorage.getItem('txtNo_Hp');
        txtAkses.value = localStorage.getItem('txtAkses');

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
                title: 'Diperbarui!',
                text: "Daftar terbaru.",
                icon: 'success',
                confirmButtonClass: 'mr-2'
            }).then((result) => {
                if (result.value) {
                    localStorage.removeItem('txtRFID');
                    localStorage.removeItem('txtNama');
                    localStorage.removeItem('txtId_Pegawai');
                    localStorage.removeItem('txtJabatan');
                    localStorage.removeItem('txtDepartemen');
                    localStorage.removeItem('txtMail');
                    localStorage.removeItem('txtNo_Hp');
                    localStorage.removeItem('txtAkses');
                    consultBooks();
                    location.href = './update.html';
                }
            });
        } else if (confirm == 0) {
            swalWithBootstrapButtons.fire({
                title: 'Gagal!',
                text: "Informasi tetap aman.",
                icon: 'error',
                confirmButtonClass: 'mr-2'
            }).then((result) => {
                if (result.value) {
                    localStorage.removeItem('txtRFID');
                    localStorage.removeItem('txtNama');
                    localStorage.removeItem('txtId_Pegawai');
                    localStorage.removeItem('txtJabatan');
                    localStorage.removeItem('txtDepartemen');
                    localStorage.removeItem('txtMail');
                    localStorage.removeItem('txtNo_Hp');
                    localStorage.removeItem('txtAkses');
                    consultBooks();
                    location.href = './update.html';
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
                <td class="text-center"><button type="button" class="btn btn-danger" onclick="showSwal('passing-parameter-execute-cancel', '${libros[i].rfid}')">Eliminar</button></td>
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
                'akses': akses[i]
            });
        }

        showUsers(libros);
    });
}

const formSubmit = (event) => {
    event.preventDefault();
    return false;
}