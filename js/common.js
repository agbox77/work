// Общие функции для работы с localStorage
function loadData(key, defaultData) {
    const stored = localStorage.getItem(key);
    if (stored) {
        try { return JSON.parse(stored); } catch(e) {}
    }
    return defaultData;
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Загрузка начальных данных сотрудников из JSON, если нет в localStorage
async function initEmployees() {
    const depts = ['МЭО', 'ОТТ', 'ДИЗАЙНЕР'];
    let allEmps = loadData('employees', null);
    if (!allEmps) {
        try {
            const resp = await fetch('data/employees.json');
            allEmps = await resp.json();
        } catch {
            allEmps = { 'МЭО': [], 'ОТТ': [], 'ДИЗАЙНЕР': [] };
        }
        saveData('employees', allEmps);
    }
    return allEmps;
}
