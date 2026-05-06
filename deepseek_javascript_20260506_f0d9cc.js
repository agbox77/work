document.addEventListener('DOMContentLoaded', () => {
    const docList = document.getElementById('docList');
    const documents = [
        { name: 'Бланк заявления на зачисление', file: '#' },
        { name: 'Договор об оказании платных услуг', file: '#' },
        { name: 'Согласие на обработку данных', file: '#' },
        { name: 'Образец заполнения журнала', file: '#' }
    ];
    docList.innerHTML = documents.map(d => `<li><a href="${d.file}" target="_blank">${d.name}</a></li>`).join('');
});