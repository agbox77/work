document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('excelUpload');
    const loadSampleBtn = document.getElementById('loadSample');
    const container = document.getElementById('scheduleTableContainer');

    function displaySchedule(rows) {
        if (!rows.length) {
            container.innerHTML = '<p>Нет данных для отображения.</p>';
            return;
        }
        const headers = Object.keys(rows[0]);
        let html = '<table><thead><tr>';
        headers.forEach(h => html += `<th>${h}</th>`);
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            headers.forEach(h => html += `<td>${row[h] || ''}</td>`);
            html += '</tr>';
        });
        html += '</tbody></table>';
        container.innerHTML = html;
    }

    function processExcelData(data) {
        // data – массив объектов, ключи – из первой строки
        const filtered = data.filter(row => {
            const dept = row['Отдел'] || row['D'] || ''; // русская колонка "Отдел"
            return dept === 'МЭО' || dept === 'ОТТ';
        });
        displaySchedule(filtered);
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (loadEvt) => {
            const data = new Uint8Array(loadEvt.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheet];
            const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            if (json.length) {
                const headers = json[0];
                const rows = json.slice(1).map(row => {
                    const obj = {};
                    headers.forEach((h, i) => { obj[h] = row[i] !== undefined ? row[i] : ''; });
                    return obj;
                });
                processExcelData(rows);
            }
        };
        reader.readAsArrayBuffer(file);
    });

    loadSampleBtn.onclick = async () => {
        try {
            const resp = await fetch('data/schedule_sample.json');
            const sample = await resp.json();
            displaySchedule(sample);
        } catch {
            alert('Не удалось загрузить пример расписания');
        }
    };
});
