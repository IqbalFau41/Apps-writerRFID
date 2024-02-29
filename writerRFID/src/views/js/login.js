let error = document.querySelector('#text-error');
let email = document.querySelector('#txtEmail');
let password = document.querySelector('#txtPassword');

let btnLogin = document.querySelector('#btnLogin');

btnLogin.addEventListener('click', () => {
    validateInputs();
});

let btnRegister = document.querySelector('#btnRegister');

btnRegister.addEventListener('click', () => {
    page_register();
});


const formSubmit = (event) => {
    event.preventDefault();
    login();
    return false;
}

const login = () => {
    if (!(email.value == '' && password.value == '')) {
        const data = { email: email.value, password: password.value };

        window.ipcRender.send('login', data);

        setTimeout(errorLogin, 300);
    }
}



const errorLogin = () => {
    error.innerHTML = 'Email atau kata sandi salah.';
    error.classList.remove('text-muted');
    error.classList.add('text-danger');

    email.value = '';
    password.value = '';
    email.focus();
}

const validateInputs = () => {
    if (email.value == '') {
        error.innerHTML = 'Masukkan alamat email Anda.';
        error.classList.remove('text-muted');
        error.classList.add('text-danger');
    } else if (password.value == '') {
        error.innerHTML = 'Masukkan kata sandi Anda.';
        error.classList.remove('text-muted');
        error.classList.add('text-danger');
    }
}

const page_register = () => {
    window.ipcRender.send('page_register', 'page_register');
}