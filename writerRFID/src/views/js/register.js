const txtEmail = document.querySelector('#txtEmail');
const txtNama_Admin = document.querySelector('#txtNama_Admin');
const txtPermissions = document.querySelector('#txtPermissions');
const txtPassword = document.querySelector('#txtPassword');
const txtProfile = document.querySelector('#txtProfile');
const btmTambah = document.querySelector('#btmTambah');

// Initial focus on Nama Admin field
txtNama_Admin.focus();

// Event listener for Email input
txtEmail.addEventListener('input', function () {
    const email = this.value;
    const errorElement = document.getElementById('emailError');

    if (!isValidEmailFormat(email)) {
        errorElement.textContent = 'Invalid email format';
        txtEmail.classList.add('is-invalid');
    } else {
        errorElement.textContent = '';
        txtEmail.classList.remove('is-invalid');
    }
});

// Function to check valid email format
function isValidEmailFormat(input) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(input);
}

// Event listener for Password input
txtPassword.addEventListener('input', function () {
    const password = this.value;
    const errorElement = document.getElementById('passwordError');

    if (password.length < 6) {
        errorElement.textContent = 'Kata sandi harus terdiri dari minimal 6 karakter.';
        btmTambah.disabled = true; // Disable the button
    } else {
        errorElement.textContent = '';
        btmTambah.disabled = false; // Enable the button
    }
});

// Event listener for "Tambah" button click
btmTambah.addEventListener('click', () => {
    if (!(txtEmail.value == '' || txtNama_Admin.value == '' || txtPermissions.value == '' || txtPassword.value == '' || txtProfile.value == '')) {
        const data = { email: txtEmail.value, nama_admin: txtNama_Admin.value, permissions: txtPermissions.value, password: txtPassword.value, profile: txtProfile.value };
        addBook(data);
    }
});

// Function to add book data
const addBook = (data) => {
    window.ipcRender.send('TambahUser', data);
    localStorage.setItem('reload', '1');
    location.reload();
};

// Display confirmation message based on the result
if (localStorage.getItem('reload') == '1') {
    localStorage.removeItem('reload');
    window.ipcRender.invoke('konfirmasiAddUser').then((confirm) => {
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
                title: 'Berhasil!',
                text: 'Pendaftaran admin berhasil ditambahkan.',
                icon: 'success',
                confirmButtonClass: 'mr-2'
            }).then((result) => {
                if (result.value) {
                    consultBooks();
                    page_login();
                }
            });
        } else if (confirm == 0) {
            swalWithBootstrapButtons.fire({
                title: 'Gagal!',
                text: 'Pendaftaran admin belum berhasil ditambahkan.',
                icon: 'error',
                confirmButtonClass: 'mr-2'
            }).then((result) => {
                if (result.value) {
                    consultBooks();
                    page_login();
                }
            });
        }
    });
}

// Function to display user data in the table
const showUsers = (libros) => {
    const tableUsers = document.querySelector('#tabla-libros');
    let texto = '';

    tableUsers.innerHTML = '';

    for (let i = 0; i < libros.length; i++) {
        texto +=
            `<tr>
                <td>${libros[i].nama_admin}</td>
                <td>${libros[i].email}</td>
                <td>${libros[i].permissions}</td>
                <td>${libros[i].password}</td>
                <td>${libros[i].profile}</td>
                <td class="text-center"><button type="button" class="btn btn-danger" onclick="showSwal('passing-parameter-execute-cancel', '${libros[i].email}')">Hapus</button></td>
            </tr>`;
    }

    tableUsers.innerHTML = texto;
};

// Function to fetch and display user data
const consultBooks = () => {
    window.ipcRender.invoke('getBooks').then((result) => {
        let { email, password, permissions, nama_admin, profile } = result;

        email = email.replace(/(^_)|(_$)/g, '');
        nama_admin = nama_admin.replace(/(^_)|(_$)/g, '');
        permissions = permissions.replace(/(^_)|(_$)/g, '');
        password = password.replace(/(^_)|(_$)/g, '');
        profile = profile.replace(/(^_)|(_$)/g, '');

        email = email.split('_');
        nama_admin = nama_admin.split('_');
        permissions = permissions.split('_');
        password = password.split('_');
        profile = profile.split('_');

        const libros = [];

        for (let i = 0; i < email.length; i++) {
            libros.push({
                'email': email[i],
                'nama_admin': nama_admin[i],
                'permissions': permissions[i],
                'password': password[i],
                'profile': profile[i],
            });
        }

        showUsers(libros);
    });
};

// Function to capitalize the first letter of a string
function capitalizeFirstLetter(input) {
    var inputValue = input.value;
    inputValue = inputValue.toLowerCase().replace(/\b\w/g, function (firstLetter) {
        return firstLetter.toUpperCase();
    });
    input.value = inputValue;
}

// Function to prevent form submission
const formSubmit = (event) => {
    event.preventDefault();
    return false;
};

// Function to navigate to login page
const page_login = () => {
    window.ipcRender.send('page_login', 'page_login');
};
