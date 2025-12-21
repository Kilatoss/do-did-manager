export function renderTaskList(tasks) {
    const container = document.createElement('div');
    container.className = 'task-list-container';

    if (tasks.length === 0) {
        container.innerHTML = `<p class="empty-state">Nenhuma tarefa encontrada nesta categoria.</p>`;
        return container;
    }

    const table = document.createElement('table');
    table.className = 'task-table';
    
    // Cabeçalho da Tabela
    table.innerHTML = `
        <thead>
            <tr>
                <th>Estado</th>
                <th>Tarefa & Sub-tarefas</th>
                <th>Urgência</th>
                <th>Prazo</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    tasks.forEach(task => {
        const row = document.createElement('tr');
        
        const date = new Date(task.deadline).toLocaleDateString('pt-PT');
        
        // Lógica de Cor da Urgência 
        let urgencyClass = 'urgency-low';
        if (task.urgency === 'Vermelho') urgencyClass = 'urgency-high';
        else if (task.urgency === 'Amarelo') urgencyClass = 'urgency-medium';

        // Renderizar Sub-tasks (se existirem)
        let subtasksHTML = '';
        if (task.subTasks && task.subTasks.length > 0) {
            subtasksHTML = `<ul class="subtask-list">`;
            task.subTasks.forEach(st => {
                const check = st.completed ? 'checked' : '';
                // Checkbox apenas visual por enquanto
                subtasksHTML += `
                    <li>
                        <input type="checkbox" ${check} disabled> 
                        <span class="${st.completed ? 'completed-text' : ''}">${st.title}</span>
                    </li>`;
            });
            subtasksHTML += `</ul>`;
        }

        row.innerHTML = `
            <td>
                <span class="status-badge ${task.status.toLowerCase()}">${task.status}</span>
            </td>
            <td>
                <div class="task-info">
                    <strong>${task.title}</strong>
                    <p class="task-desc">${task.description || ''}</p>
                    ${subtasksHTML}
                </div>
            </td>
            <td>
                <span class="urgency-dot ${urgencyClass}"></span> ${task.urgency}
            </td>
            <td>${date}</td>
        `;

        tbody.appendChild(row);
    });

    container.appendChild(table);
    return container;
}