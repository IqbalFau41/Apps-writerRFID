let currentPage = 0; // Menyimpan indeks halaman saat ini
const rowsPerPage = 10; // Jumlah baris per halaman
let tabel = []; // Mendefinisikan variabel tabel di luar fungsi consultBooks

document.addEventListener('DOMContentLoaded', function () {
    pageConsult = new PageConsult(window);
});

class PageConsult {
    constructor() {
        this.consultBooks();
    }

    // Fungsi untuk memuat data buku
    consultBooks() {
        // Memanggil fungsi IPC untuk mendapatkan data buku
        window.ipcRender.invoke('getBooks').then((result) => {
            // Mendapatkan data buku dari hasil IPC
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

            for (let i = 0; i < rfid.length; i++) {
                tabel.push({
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

            // Menampilkan data buku pada halaman saat ini
            this.showCurrentPage(tabel);
        });
    }

    showCurrentPage(tabel) {
        // Menghitung indeks awal dan akhir untuk data pada halaman saat ini
        const startIndex = currentPage * rowsPerPage;
        const endIndex = Math.min(startIndex + rowsPerPage, tabel.length); // Menggunakan Math.min untuk memastikan endIndex tidak melebihi jumlah total data
        const totalEntries = tabel.length;

        // Memotong data sesuai dengan halaman saat ini
        const currentPageData = tabel.slice(startIndex, endIndex);

        // Menampilkan informasi jumlah data yang ditampilkan
        document.getElementById('entriesInfo').innerText = `Menampilkan ${startIndex + 1} hingga ${endIndex} dari ${totalEntries} entri`;

        // Menampilkan data pada tabel
        this.showUsers(currentPageData);

        // Menampilkan atau menyembunyikan tombol "Previous" dan "Next" sesuai dengan kondisi halaman saat ini
        toggleButtons();
    }

    // Menampilkan data pada tabel
    showUsers(tabel) {
        let texto = '';

        for (let i = 0; i < tabel.length; i++) {
            texto +=
                `
                <tr>
                    <td>${tabel[i].id_pegawai}</td>
                    <td>${tabel[i].nama}</td>
                    <td>${tabel[i].jabatan}</td>
                    <td>${tabel[i].departemen}</td>
                    <td>${tabel[i].surat}</td>
                    <td>${tabel[i].no_hp}</td>
                    <td>${tabel[i].akses}</td>
                    <td class="text-center"><button type="button" class="btn btn-danger" onclick="showSwal('passing-parameter-execute-cancel', '${tabel[i].rfid}')">Hapus</button></td>
                </tr>
            `;
        }

        document.querySelector('#data-table tbody').innerHTML = texto;
    }
}

// Menampilkan atau menyembunyikan tombol "Previous" dan "Next" sesuai dengan kondisi halaman saat ini
function toggleButtons() {
    document.getElementById('nextButton').disabled = currentPage >= Math.ceil(tabel.length / rowsPerPage) - 1;
    document.getElementById('previousButton').disabled = currentPage <= 0;
}

// Fungsi untuk menampilkan halaman berikutnya
function showNextPage() {
    currentPage++;
    pageConsult.showCurrentPage(tabel);
}

// Fungsi untuk menampilkan halaman sebelumnya
function showPreviousPage() {
    currentPage--;
    pageConsult.showCurrentPage(tabel);
}

// Fungsi untuk memproses penghapusan buku dan menampilkan konfirmasi
function handleBookDeletionConfirmation() {
    localStorage.setItem('reload', '1');
    location.reload();
}

// Fungsi untuk pencarian berdasarkan nama
function filterUsers(searchTerm) {
    const filteredTabel = tabel.filter(data => data.nama.toLowerCase().includes(searchTerm));

    // Menghapus duplikat menggunakan Set
    const uniqueFilteredTabel = Array.from(new Set(filteredTabel.map(JSON.stringify))).map(JSON.parse);

    console.log('Hasil pencarian:', uniqueFilteredTabel); // Tampilkan hasil pencarian unik di konsol
    pageConsult.showCurrentPage(uniqueFilteredTabel);
}

// Menangani penekanan tombol "Hapus" pada tabel
function showSwal(type, RFID) {
    'use strict';
    if (type === 'passing-parameter-execute-cancel') {
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                confirmButton: 'btn btn-success',
                cancelButton: 'btn btn-danger mr-2'
            },
            buttonsStyling: false,
            allowEscapeKey: false,
            allowOutsideClick: false
        });

        swalWithBootstrapButtons.fire({
            title: 'Apakah Anda yakin?',
            text: "Tindakan ini tidak dapat dibatalkan.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonClass: 'mr-2',
            confirmButtonText: 'Ya, hapus',
            cancelButtonText: 'Tidak, batalkan',
            reverseButtons: true
        }).then((result) => {
            if (result.value) {
                window.ipcRender.send('deleteBook', RFID);
                handleBookDeletionConfirmation();
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                swalWithBootstrapButtons.fire(
                    'Dibatalkan',
                    'Informasi tetap aman.',
                    'error'
                );
            }
        });
    }
}

// Menangani perubahan pada input pencarian
document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    filterUsers(searchTerm);
});

// Menangani penekanan tombol "Berikutnya"
document.getElementById('nextButton').addEventListener('click', function () {
    showNextPage();
});

// Menangani penekanan tombol "Sebelumnya"
document.getElementById('previousButton').addEventListener('click', function () {
    showPreviousPage();
});
