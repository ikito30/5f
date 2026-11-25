import {
    apiRequest,
    getApiConfig,
    loadSurveyStats
} from './storage.js';

const CONFIRMATION_TEXT = 'УДАЛИТЬ';

const configNotice = document.getElementById('configNotice');
const loginSection = document.getElementById('loginSection');
const adminSection = document.getElementById('adminSection');
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const loginButton = document.getElementById('loginBtn');
const loginMessage = document.getElementById('loginMessage');
const adminEmail = document.getElementById('adminEmail');
const recordCount = document.getElementById('recordCount');
const refreshCountButton = document.getElementById('refreshCountBtn');
const logoutButton = document.getElementById('logoutBtn');
const confirmationInput = document.getElementById('confirmationInput');
const clearDatabaseButton = document.getElementById('clearDatabaseBtn');
const adminMessage = document.getElementById('adminMessage');

let csrfToken = '';

function setMessage(element, message = '', type = '') {
    element.textContent = message;
    element.className = `form-message${type ? ` ${type}` : ''}`;
}

function setBusy(button, busy, busyText, normalText) {
    button.disabled = busy;
    button.textContent = busy ? busyText : normalText;
}

async function refreshRecordCount() {
    recordCount.textContent = '…';
    try {
        const stats = await loadSurveyStats();
        recordCount.textContent = String(stats.total || 0);
    } catch (error) {
        recordCount.textContent = 'Ошибка';
        setMessage(adminMessage, `Не удалось получить количество записей: ${error.message}`, 'error');
    }
}

function showLogin() {
    loginSection.hidden = false;
    adminSection.hidden = true;
    passwordInput.value = '';
    confirmationInput.value = '';
    clearDatabaseButton.disabled = true;
    csrfToken = '';
}

async function showAdmin(email, token) {
    csrfToken = token || csrfToken;
    loginSection.hidden = true;
    adminSection.hidden = false;
    adminEmail.textContent = email || 'Администратор';
    setMessage(loginMessage);
    setMessage(adminMessage);
    await refreshRecordCount();
}

async function handleLogin(event) {
    event.preventDefault();
    setMessage(loginMessage);
    setBusy(loginButton, true, 'Проверка...', 'Войти');

    try {
        const result = await apiRequest('admin-login.php', {
            method: 'POST',
            body: {
                email: emailInput.value.trim(),
                password: passwordInput.value
            }
        });
        if (!result?.ok) throw new Error(result?.message || 'Не удалось выполнить вход.');
        await showAdmin(result.email, result.csrfToken);
    } catch (error) {
        showLogin();
        setMessage(loginMessage, error.message || 'Не удалось выполнить вход.', 'error');
    } finally {
        setBusy(loginButton, false, 'Проверка...', 'Войти');
    }
}

async function handleLogout() {
    try {
        if (csrfToken) {
            await apiRequest('admin-logout.php', {
                method: 'POST',
                csrfToken
            });
        }
    } catch {
        // Даже при ошибке сервера локально возвращаем форму входа.
    }
    showLogin();
    setMessage(loginMessage, 'Сеанс завершён.', 'success');
}

async function handleClearDatabase() {
    if (confirmationInput.value.trim() !== CONFIRMATION_TEXT) return;

    setMessage(adminMessage);
    clearDatabaseButton.disabled = true;
    clearDatabaseButton.textContent = 'Удаление...';

    try {
        const result = await apiRequest('clear-results.php', {
            method: 'POST',
            csrfToken,
            body: { confirmation: CONFIRMATION_TEXT }
        });
        confirmationInput.value = '';
        recordCount.textContent = '0';
        setMessage(adminMessage, `Удаление завершено. Удалено записей: ${Number(result?.deleted) || 0}.`, 'success');
    } catch (error) {
        setMessage(adminMessage, `Не удалось очистить базу: ${error.message}`, 'error');
        if (/вход|автор|сеанс|401/i.test(String(error.message))) {
            showLogin();
        }
    } finally {
        clearDatabaseButton.textContent = 'Удалить все результаты';
        clearDatabaseButton.disabled = confirmationInput.value.trim() !== CONFIRMATION_TEXT;
    }
}

confirmationInput.addEventListener('input', () => {
    clearDatabaseButton.disabled = confirmationInput.value.trim() !== CONFIRMATION_TEXT;
    setMessage(adminMessage);
});
loginForm.addEventListener('submit', handleLogin);
logoutButton.addEventListener('click', handleLogout);
refreshCountButton.addEventListener('click', refreshRecordCount);
clearDatabaseButton.addEventListener('click', handleClearDatabase);

async function initialize() {
    try {
        getApiConfig();
        configNotice.className = 'mode-notice connected';
        configNotice.textContent = 'Подключение к серверному API MySQL настроено.';
    } catch (error) {
        configNotice.className = 'mode-notice error';
        configNotice.textContent = error.message;
        loginForm.querySelectorAll('input, button').forEach(element => {
            element.disabled = true;
        });
        return;
    }

    try {
        const status = await apiRequest('admin-status.php');
        if (status?.authenticated) {
            await showAdmin(status.email, status.csrfToken);
        } else {
            showLogin();
        }
    } catch (error) {
        showLogin();
        setMessage(loginMessage, `Не удалось проверить сессию: ${error.message}`, 'error');
    }
}

initialize();
