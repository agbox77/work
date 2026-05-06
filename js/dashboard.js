document.addEventListener('DOMContentLoaded', async () => {
    // Календарь
    const calendarGrid = document.getElementById('calendarGrid');
    const monthYearSpan = document.getElementById('currentMonthYear');
    const selectedDateSpan = document.getElementById('selectedDate');
    const taskInput = document.getElementById('taskInput');
    const taskCategory = document.getElementById('taskCategory');
    const addTaskBtn = document.getElementById('addTask');
    const taskList = document.getElementById('taskList');

    let currentDate = new Date();
    let selectedDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
    
    function renderCalendar() {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay() || 7; // Пн-Вс
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        monthYearSpan.textContent = `${currentDate.toLocaleString('ru', { month: 'long' })} ${year}`;
        
        let html = '<div class="day">Пн</div><div class="day">Вт</div><div class="day">Ср</div><div class="day">Чт</div><div class="day">Пт</div><div class="day">Сб</div><div class="day">Вс</div>';
        for (let i = 1; i < firstDay; i++) html += '<div class="day"></div>';
        const today = new Date();
        for (let d = 1; d <= daysInMonth; d++) {
            const dateObj = new Date(year, month, d);
            let cls = 'day';
            if (dateObj.toDateString() === today.toDateString()) cls += ' today';
            if (dateObj.toDateString() === selectedDay.toDateString()) cls += ' selected';
            html += `<div class="${cls}" data-date="${dateObj.toISOString()}">${d}</div>`;
        }
        calendarGrid.innerHTML = html;
    }

    calendarGrid.addEventListener('click', (e) => {
        if (e.target.classList.contains('day') && e.target.dataset.date) {
            selectedDay = new Date(e.target.dataset.date);
            selectedDateSpan.textContent = selectedDay.toLocaleDateString('ru');
            renderCalendar();
            renderTasks();
        }
    });

    document.getElementById('prevMonth').onclick = () => {
        currentDate.setMonth(currentDate.getMonth() - 1);
        renderCalendar();
    };
    document.getElementById('nextMonth').onclick = () => {
        currentDate.setMonth(currentDate.getMonth() + 1);
        renderCalendar();
    };

    function getTaskKey() {
        return selectedDay.toISOString().split('T')[0];
    }

    function getTasks() {
        const allTasks = loadData('tasks', {});
        const key = getTaskKey();
        return allTasks[key] || [];
    }

    function saveTasks(tasks) {
        const allTasks = loadData('tasks', {});
        allTasks[getTaskKey()] = tasks;
        saveData('tasks', allTasks);
    }

    function renderTasks() {
        const tasks = getTasks();
        taskList.innerHTML = tasks.map((t, idx) => 
            `<li>[${t.category}] ${t.text} <button class="delete-btn" data-idx="${idx}">×</button></li>`
        ).join('');
    }

    addTaskBtn.onclick = () => {
        const text = taskInput.value.trim();
        if (!text) return;
        const tasks = getTasks();
        tasks.push({ text, category: taskCategory.value });
        saveTasks(tasks);
        taskInput.value = '';
        renderTasks();
    };

    taskList.onclick = (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const idx = e.target.dataset.idx;
            const tasks = getTasks();
            tasks.splice(idx, 1);
            saveTasks(tasks);
            renderTasks();
        }
    };

    selectedDateSpan.textContent = selectedDay.toLocaleDateString('ru');
    renderCalendar();
    renderTasks();

    // Редактируемые таблицы сотрудников
    const employees = await initEmployees();
    function renderEmployeeTable(dept, tableId) {
        const tbody = document.querySelector(`#${tableId} tbody`);
        const data = employees[dept] || [];
        tbody.innerHTML = data.map((emp, idx) => `
            <tr>
                <td contenteditable="true" data-field="name">${emp.name || ''}</td>
                <td contenteditable="true" data-field="birth">${emp.birth || ''}</td>
                <td contenteditable="true" data-field="phone_home">${emp.phone_home || ''}</td>
                <td contenteditable="true" data-field="phone_mob">${emp.phone_mob || ''}</td>
                <td><button class="delete-btn" data-idx="${idx}">×</button></td>
            </tr>
        `).join('');
    }

    function saveTableEdits(dept, tableId) {
        const rows = document.querySelectorAll(`#${tableId} tbody tr`);
        const newData = [];
        rows.forEach(row => {
            const cells = row.querySelectorAll('td[contenteditable]');
            newData.push({
                name: cells[0].textContent.trim(),
                birth: cells[1].textContent.trim(),
                phone_home: cells[2].textContent.trim(),
                phone_mob: cells[3].textContent.trim()
            });
        });
        employees[dept] = newData;
        saveData('employees', employees);
    }

    ['МЭО', 'ОТТ', 'ДИЗАЙНЕР'].forEach(dept => {
        const tableId = dept === 'МЭО' ? 'meoTable' : (dept === 'ОТТ' ? 'ottTable' : 'designerTable');
        renderEmployeeTable(dept, tableId);
        document.querySelector(`#${tableId}`).addEventListener('input', () => saveTableEdits(dept, tableId));
    });

    document.querySelectorAll('.add-row').forEach(btn => {
        btn.onclick = () => {
            const dept = btn.dataset.dept;
            employees[dept].push({ name: '', birth: '', phone_home: '', phone_mob: '' });
            saveData('employees', employees);
            const tableId = dept === 'МЭО' ? 'meoTable' : (dept === 'ОТТ' ? 'ottTable' : 'designerTable');
            renderEmployeeTable(dept, tableId);
        };
    });

    // Удаление через делегирование
    document.querySelector('#employees-section').addEventListener('click', (e) => {
        if (e.target.classList.contains('delete-btn')) {
            const idx = e.target.dataset.idx;
            const dept = e.target.closest('table').id === 'meoTable' ? 'МЭО' :
                        e.target.closest('table').id === 'ottTable' ? 'ОТТ' : 'ДИЗАЙНЕР';
            employees[dept].splice(idx, 1);
            saveData('employees', employees);
            const tableId = dept === 'МЭО' ? 'meoTable' : (dept === 'ОТТ' ? 'ottTable' : 'designerTable');
            renderEmployeeTable(dept, tableId);
        }
    });
});
