let currentPage = 0; // Menyimpan indeks halaman saat ini
const rowsPerPage = 10; // Jumlah baris per halaman
let tabel = []; // Mendefinisikan variabel tabel di luar fungsi consultBooks

const updateBook = (RFID) => {
    window.ipcRender.send('consultBook', RFID);

    location.href = './form-modificar.html';
}

// Memuat data awal saat dokumen dimuat
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
            let { akses, jabatan, departemen, surat, no_hp, nama, id_pegawai } = result;

            nama = nama.replace(/(^_)|(_$)/g, '');
            id_pegawai = id_pegawai.replace(/(^_)|(_$)/g, '');
            jabatan = jabatan.replace(/(^_)|(_$)/g, '');
            departemen = departemen.replace(/(^_)|(_$)/g, '');
            surat = surat.replace(/(^_)|(_$)/g, '');
            no_hp = no_hp.replace(/(^_)|(_$)/g, '');
            akses = akses.replace(/(^_)|(_$)/g, '');

            nama = nama.split('_');
            id_pegawai = id_pegawai.split('_');
            jabatan = jabatan.split('_');
            departemen = departemen.split('_');
            surat = surat.split('_');
            no_hp = no_hp.split('_');
            akses = akses.split('_');

            for (let i = 0; i < id_pegawai.length; i++) {
                tabel.push({
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
            pageConsult.showCurrentPage(tabel);
        });
    }

    // Fungsi untuk menampilkan data pada halaman saat ini
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
        showUsers(currentPageData);

        // Menampilkan atau menyembunyikan tombol "Previous" dan "Next" sesuai dengan kondisi halaman saat ini
        toggleButtons();
    }

}

// Menampilkan data pada tabel
const showUsers = (tabel) => {
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
                <td class="text-center"><button type="button" class="btn btn-success" onclick="updateBook('${tabel[i].id_pegawai}', '${tabel[i].nama}')">Ubah</button></td>
            </tr>
        `;
    }

    document.querySelector('#data-table tbody').innerHTML = texto;
}

document.getElementById('searchInput').addEventListener('input', function () {
    const searchTerm = this.value.toLowerCase();
    filterUsers(searchTerm);
});

// Fungsi untuk pencarian berdasarkan nama
function filterUsers(searchTerm) {
    const filteredTabel = tabel.filter(data => data.nama.toLowerCase().includes(searchTerm));
    pageConsult.showCurrentPage(filteredTabel);
}


document.getElementById('nextButton').addEventListener('click', function () {
    showNextPage();
});

document.getElementById('previousButton').addEventListener('click', function () {
    showPreviousPage();
});
