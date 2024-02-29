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

// Fungsi untuk menampilkan atau menyembunyikan tombol "Previous" dan "Next" sesuai dengan kondisi halaman saat ini
function toggleButtons() {
    document.getElementById('nextButton').disabled = currentPage >= Math.ceil(tabel.length / rowsPerPage) - 1;
    document.getElementById('previousButton').disabled = currentPage <= 0;
}

// Fungsi untuk mengurutkan data libros secara ascending berdasarkan kolom tertentu
function sortLibrosAscending(column) {
    tabel.sort((a, b) => a[column].localeCompare(b[column]));
}

// Fungsi untuk mengurutkan data libros secara descending berdasarkan kolom tertentu
function sortLibrosDescending(column) {
    tabel.sort((a, b) => b[column].localeCompare(a[column]));
}

// Menangani penekanan judul kolom untuk mengurutkan data secara ascending dan descending
document.querySelectorAll('.sortable').forEach(column => {
    column.addEventListener('click', function () {
        const columnName = this.dataset.column;
        const sortIcon = this.querySelector('.feather');
        if (sortIcon.classList.contains('feather-arrow-down')) {
            sortLibrosAscending(columnName);
            sortIcon.classList.remove('feather-arrow-down');
        } else {
            sortLibrosDescending(columnName);
            sortIcon.classList.add('feather-arrow-down');
        }
        pageConsult.showCurrentPage(tabel);
    });
});
