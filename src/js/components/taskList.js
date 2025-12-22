export function renderTaskList(tasks) {
  const container = document.createElement("div");
  container.className = "task-list-container";

  if (tasks.length === 0) {
    container.innerHTML = `<p class="empty-state">Nenhuma tarefa encontrada nesta categoria.</p>`;
    return container;
  }

  const table = document.createElement("table");
  table.className = "task-table";

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

  const tbody = table.querySelector("tbody");
  const now = new Date();

  tasks.forEach((task) => {
    const row = document.createElement("tr");

    let deadlineHTML = "";
    const deadlineDate = new Date(task.deadline);
    
    const isInvalidDate = isNaN(deadlineDate.getTime());
    const isDefaultDate = deadlineDate.getFullYear() === 1970;
    const hasNoDeadline = !task.deadline || isDefaultDate || isInvalidDate;

    if (hasNoDeadline) {
      deadlineHTML = `<span style="color: #888;">Sem Prazo</span>`;
    } else if (deadlineDate < now) {
      deadlineHTML = `
        <label style="color: #d32f2f; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px;">
            <input type="checkbox" class="completed-checkbox" data-task-id="${task.id || ''}"> 
            Completou?
        </label>`;
    } else {
      const pad = (n) => n.toString().padStart(2, '0');
      const day = pad(deadlineDate.getDate());
      const month = pad(deadlineDate.getMonth() + 1);
      const year = deadlineDate.getFullYear();
      const hours = pad(deadlineDate.getHours());
      const mins = pad(deadlineDate.getMinutes());
      
      const currentYear = now.getFullYear();
      const dateStr = year === currentYear 
        ? `${day}/${month} ${hours}:${mins}` 
        : `${day}/${month}/${year} ${hours}:${mins}`;

      const diffMs = deadlineDate - now;
      const diffHoursTotal = diffMs / (1000 * 60 * 60);
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      
      let countdownStr = "";
      let countdownColor = "#a0a0a0";

      if (diffHoursTotal > 72) {
        countdownStr = `${diffDays} dias restantes`;
        countdownColor = "#28a745"; 
      } else if (diffHoursTotal >= 24) {
        const remainingHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        countdownStr = `${diffDays} dias e ${remainingHours} horas restantes`;
        countdownColor = "#ffcc00";
      } else {
        const remainingHours = Math.floor(diffHoursTotal);
        const remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
        countdownStr = `${remainingHours} horas e ${remainingMinutes} minutos restantes`;
        countdownColor = "#ff4d4d"; 
      }

      deadlineHTML = `
        <div style="display: flex; flex-direction: column; line-height: 1.4;">
            <span style="font-weight: 500;">${dateStr}</span>
            <small style="color: ${countdownColor}; font-size: 0.85em;">${countdownStr}</small>
        </div>
      `;
    }

    let displayUrgencyLabel = task.urgency;
    let urgencyClass = "urgency-low";

    if (task.urgency === "Vermelho") {
      displayUrgencyLabel = "Alta";
      urgencyClass = "urgency-high";
    } else if (task.urgency === "Amarelo") {
      displayUrgencyLabel = "Média";
      urgencyClass = "urgency-medium";
    } else if (task.urgency === "Baixa") {
      displayUrgencyLabel = "Baixa";
      urgencyClass = "urgency-low";
    }

    if (task.urgency === "Normal") {
      if (hasNoDeadline) {
        displayUrgencyLabel = "Recorrente";
        urgencyClass = "urgency-recurrent";
      } else {
        const diffMs = deadlineDate - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (diffHours < 72) {
          displayUrgencyLabel = "Urgente";
          urgencyClass = "urgency-high";
        } else if (diffHours < 336) {
          displayUrgencyLabel = "Urgência Média";
          urgencyClass = "urgency-medium";
        } else {
          displayUrgencyLabel = "Pouca Urgência";
          urgencyClass = "urgency-low";
        }
      }
    }

    let subtasksHTML = "";
    if (task.subTasks && task.subTasks.length > 0) {
      subtasksHTML = `<ul class="subtask-list">`;
      task.subTasks.forEach((st) => {
        const check = st.completed ? "checked" : "";
        subtasksHTML += `
                    <li>
                        <input type="checkbox" ${check} disabled> 
                        <span class="${st.completed ? "completed-text" : ""}">${
          st.title
        }</span>
                    </li>`;
      });
      subtasksHTML += `</ul>`;
    }

    row.innerHTML = `
            <td>
                <span class="status-badge ${task.status.toLowerCase()}">${
      task.status
    }</span>
            </td>
            <td>
                <div class="task-info">
                    <strong>${task.title}</strong>
                    <p class="task-desc">${task.description || ""}</p>
                    ${subtasksHTML}
                </div>
            </td>
            <td>
                <span class="urgency-dot ${urgencyClass}"></span> ${displayUrgencyLabel}
            </td>
            <td>${deadlineHTML}</td>
        `;

    tbody.appendChild(row);
  });

  container.appendChild(table);
  return container;
}
