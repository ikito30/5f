import { apiRequest, getApiConfig } from './storage.js';

const form = document.getElementById('setupForm');
const setupKeyInput = document.getElementById('setupKeyInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const button = document.getElementById('setupBtn');
const message = document.getElementById('setupMessage');

function showMessage(text = '', type = '') {
    message.textContent = text;
    message.className = `form-message${type ? ` ${type}` : ''}`;
}

try {
    getApiConfig();
} catch (error) {
    showMessage(error.message, 'error');
    form.querySelectorAll('input, button').forEach(el => el.disabled = true);
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    showMessage();
    button.disabled = true;
    button.textContent = 'Создание...';

    try {
        const result = await apiRequest('setup-admin.php', {
            method: 'POST',
            body: {
                setupKey: setupKeyInput.value,
                email: emailInput.value.trim(),
                password: passwordInput.value
            }
        });
        showMessage(result?.message || 'Администратор создан.', 'success');
        setupKeyInput.value = '';
        passwordInput.value = '';
    } catch (error) {
        showMessage(error.message || 'Не удалось создать администратора.', 'error');
    } finally {
        button.disabled = false;
        button.textContent = 'Создать администратора';
    }
});
