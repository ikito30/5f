import { FACTOR_KEYS, FACTOR_NAMES } from './data.js';

const SCORE_MIN = 1;
const SCORE_MAX = 4;

function cleanBaseUrl(value) {
    return String(value ?? '').trim().replace(/\/+$/, '');
}

export function getApiConfig() {
    const config = window.APP_CONFIG ?? {};
    const apiBaseUrl = cleanBaseUrl(config.apiBaseUrl);
    if (!apiBaseUrl) {
        throw new Error('В config.js не указан apiBaseUrl.');
    }
    return { apiBaseUrl };
}

export function apiUrl(path) {
    const { apiBaseUrl } = getApiConfig();
    return `${apiBaseUrl}/${String(path).replace(/^\/+/, '')}`;
}

export async function parseApiError(response) {
    try {
        const body = await response.json();
        return body?.message || body?.error || `HTTP ${response.status}`;
    } catch {
        return `HTTP ${response.status}`;
    }
}

export async function apiRequest(path, {
    method = 'GET',
    body,
    signal,
    csrfToken
} = {}) {
    const headers = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (csrfToken) headers['X-CSRF-Token'] = csrfToken;

    const response = await fetch(apiUrl(path), {
        method,
        signal,
        credentials: 'include',
        headers,
        body: body === undefined ? undefined : JSON.stringify(body)
    });

    if (!response.ok) {
        throw new Error(await parseApiError(response));
    }
    if (response.status === 204) return null;
    return response.json();
}

function normalizeScore(value) {
    const number = Number(value);
    return Number.isFinite(number) && number >= SCORE_MIN && number <= SCORE_MAX
        ? Math.round(number * 100) / 100
        : null;
}

function validateResult(result) {
    const normalized = {};
    for (const key of FACTOR_KEYS) {
        const value = normalizeScore(result?.[key]);
        if (value === null) {
            throw new Error(`Некорректное значение фактора «${FACTOR_NAMES[key]}».`);
        }
        normalized[key] = value;
    }
    return normalized;
}

export async function saveSurveyResult(result) {
    const normalized = validateResult(result);
    return apiRequest('save-result.php', {
        method: 'POST',
        body: Object.fromEntries(
            FACTOR_KEYS.map(key => [`${key}_score`, normalized[key]])
        )
    });
}

export async function loadSurveyStats({ signal } = {}) {
    const payload = await apiRequest('stats.php', { signal });
    if (!payload?.ok) {
        throw new Error(payload?.message || 'Сервер не вернул статистику.');
    }
    return payload;
}
