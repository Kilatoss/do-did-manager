import { ApiService } from "../services/api.js";
import { AppStore } from "../app.js";

export function renderTaskList(tasks, onUpdate) {
  const container = document.createElement("div");
  container.className = "task-list-container";

  let visibleTasks = tasks.filter(t => !t.status.startsWith("Deleted"));
  const isRecurrent = (t) => {
      if (t.urgency !== 'Normal') return false;
      const d = new Date(t.deadline);
      return !t.deadline || isNaN(d.getTime()) || d.getFullYear() === 1970;
  };

 visibleTasks.sort((a, b) => {
    const isAComplete = a.status.startsWith("Completed");
    const isBComplete = b.status.startsWith("Completed");

    if (isAComplete && !isBComplete) return 1;
    if (!isAComplete && isBComplete) return -1;

    if (!isAComplete && !isBComplete) {
      const recurrentA = isRecurrent(a);
      const recurrentB = isRecurrent(b);

      if (recurrentA && !recurrentB) return 1;
      if (!recurrentA && recurrentB) return -1;

      const urgencyWeight = { "Alta": 2, "Media": 1, "Normal": 3, "Baixa": 0 };
      const weightA = urgencyWeight[a.urgency] || 0;
      const weightB = urgencyWeight[b.urgency] || 0;
      return weightB - weightA;
    }
    
    return 0;
  });

  if (visibleTasks.length === 0) {
    container.innerHTML = `<p class="empty-state">Nenhuma tarefa encontrada.</p>`;
    return container;
  }

  const tableWrapper = document.createElement("div");
  tableWrapper.className = "table-responsive";

  const table = document.createElement("table");
  table.className = "task-table";
  table.innerHTML = `
        <thead>
            <tr>
                <th>Estado</th>
                <th>Tarefa & Sub-tarefas</th>
                <th>Urgência</th>
                <th>Prazo</th>
                <th style="text-align: center;">Ações</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;

  const tbody = table.querySelector("tbody");

  const refreshTable = () => {
    const newTable = renderTaskList(tasks, onUpdate);
    container.replaceWith(newTable);
    if(onUpdate) onUpdate();
  };

  const now = new Date();

  visibleTasks.forEach((task) => {
    const row = document.createElement("tr");
    const isCompleted = task.status.startsWith("Completed");

    if (isCompleted) {
      row.style.opacity = "0.6";
      row.style.color = "#666";
      row.style.background = "#f9f9f9";
    }

        // --- STATUS ---
    const statusLabel = isCompleted ? "Concluído" : task.status;
    const statusClass = isCompleted ? "completed-badge" : task.status.toLowerCase();
    
    const cellStatus = `
        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
    `;

    // --- INFORMAÇÃO DA TAREFA E SUBTAREFAS ---
    let subtasksHTML = "";
    if (task.subTasks && task.subTasks.length > 0) {
      subtasksHTML = `<ul class="subtask-list">`;
      task.subTasks.forEach((st) => {
        // Se a tarefa está completa, todas as subs aparecem completas
        const isChecked = st.completed || isCompleted ? "checked" : "";
        subtasksHTML += `
            <li>
                <input type="checkbox" ${isChecked} disabled> 
                <span class="${isChecked ? "completed-text" : ""}">${st.title}</span>
            </li>`;
      });
      subtasksHTML += `</ul>`;
    }

    const cellInfo = `
        <td>
            <div class="task-info" id="info-${task.id || task._id}">
                <strong>${task.title}</strong>
                <p class="task-desc">${task.description || ""}</p>
                ${subtasksHTML}
            </div>
        </td>
    `;

    // --- URGÊNCIA ---
    let urgencyHTML = "";
    if (isCompleted) {
       urgencyHTML = ""; 
    } else {

        let displayUrgencyLabel = task.urgency;
        let urgencyClass = "urgency-low";
        
        if (task.urgency === "Alta") { displayUrgencyLabel = "Muito Urgente"; urgencyClass = "urgency-high"; }
        else if (task.urgency === "Media") { displayUrgencyLabel = "Urgente"; urgencyClass = "urgency-medium"; }
        else if (task.urgency === "Baixa") { displayUrgencyLabel = "Pouco Urgente"; urgencyClass = "urgency-low"; }
        
        const deadlineDate = new Date(task.deadline);
        const validDate = !isNaN(deadlineDate.getTime()) && task.deadline && deadlineDate.getFullYear() !== 1970;

        if (task.urgency === "Normal") {
            if (!validDate) {
                displayUrgencyLabel = "Recorrente";
                urgencyClass = "urgency-recurrent"; 
            } else {
                const diffMs = deadlineDate - now;
                const diffHours = diffMs / (1000 * 60 * 60);
                if (diffHours < 72) { displayUrgencyLabel = "Muito Urgente"; urgencyClass = "urgency-high"; }
                else if (diffHours < 336) { displayUrgencyLabel = "Urgente"; urgencyClass = "urgency-medium"; }
                else { displayUrgencyLabel = "Pouco Urgente"; urgencyClass = "urgency-low"; }
            }
        }
        urgencyHTML = `<span class="urgency-dot ${urgencyClass}"></span> ${displayUrgencyLabel}`;
    }
    const cellUrgency = `<td style="text-wrap: nowrap;">${urgencyHTML}</td>`;


    // --- PRAZO ---
    let deadlineHTML = "";
    
    if (isCompleted) {
        // Extrair timestamp do status "Completed_123456789"
        const parts = task.status.split('_');
        const timestamp = parts.length > 1 ? parseInt(parts[1]) : null;
        const dateCompleted = timestamp ? new Date(timestamp) : new Date();
        const formatted = dateCompleted.toLocaleString('pt-PT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute:'2-digit' });
        
        deadlineHTML = `<small>Completed at<br>${formatted}</small>`;
    } else {
        const deadlineDate = new Date(task.deadline);
        const isInvalidDate = isNaN(deadlineDate.getTime());
        const isDefaultDate = deadlineDate.getFullYear() === 1970;
        const hasNoDeadline = !task.deadline || isDefaultDate || isInvalidDate;

        if (hasNoDeadline) {
            deadlineHTML = `<span style="color: #888;">Sem Prazo</span>`;
        } else if (deadlineDate < now) {
            deadlineHTML = `
                <label style="color: #d32f2f; font-weight: bold; cursor: pointer; display: flex; align-items: center; gap: 5px;">
                    <input type="checkbox" class="deadline-checkbox"> 
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
            const dateStr = year === currentYear ? `${day}/${month} ${hours}:${mins}` : `${day}/${month}/${year} ${hours}:${mins}`;

            const diffMs = deadlineDate - now;
            const diffHoursTotal = diffMs / (1000 * 60 * 60);
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            let countdownStr = "";
            let countdownColor = "#666";

            if (diffHoursTotal > 72) {
                countdownStr = `${diffDays} dias restantes`;
            } else if (diffHoursTotal >= 24) {
                const remainingHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                countdownStr = `${diffDays} dias e ${remainingHours} horas restantes`;
                countdownColor = "#f57c00";
            } else {
                const remainingHours = Math.floor(diffHoursTotal);
                const remainingMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                countdownStr = `${remainingHours} horas e ${remainingMinutes} minutos restantes`;
                countdownColor = "#d32f2f";
            }

            deadlineHTML = `
                <div style="display: flex; flex-direction: column; line-height: 1.4;">
                    <span style="text-wrap: nowrap;">${dateStr}</span>
                    <small style="color: ${countdownColor}; font-size: 0.85em;">${countdownStr}</small>
                </div>
            `;
        }
    }
    const cellDeadline = `<td>${deadlineHTML}</td>`;


    // --- CÉLULA 5: AÇÕES ---
    const cellActions = document.createElement("td");
    cellActions.style.textAlign = "right";
    
    const actionsWrapper = document.createElement("div");
    actionsWrapper.className = "actions-wrapper";
    actionsWrapper.style.display = "flex";
    actionsWrapper.style.flexDirection = "column";
    actionsWrapper.style.gap = "5px";
    actionsWrapper.style.alignItems = "stretch";

    if (isCompleted) {
        const btnUndo = createBtn("↺", "Anular", "button-style secondary");
        const btnDelete = createBtn("🗑", "Apagar", "button-style danger");

        btnUndo.onclick = () => updateTaskStatus(task, "Pending", refreshTable);
        btnDelete.onclick = () => deleteTask(task, refreshTable);

        actionsWrapper.appendChild(btnUndo);
        actionsWrapper.appendChild(btnDelete);

    } else {
        const btnEdit = createBtn("✎", "Editar", "button-style");
        const btnComplete = createBtn("✓", "Concluir", "button-style success");
        const btnDelete = createBtn("🗑", "Apagar", "button-style danger");

        btnComplete.onclick = () => {
            if(confirm("Marcar tarefa como completa?")) {
                const timestamp = Date.now();
                const updatedSubtasks = (task.subTasks || []).map(st => ({ ...st, completed: true }));
                
                ApiService.updateTask(task.id || task._id, { 
                    status: `Completed_${timestamp}`,
                    subTasks: updatedSubtasks
                }).then(() => {
                    task.status = `Completed_${timestamp}`;
                    task.subTasks = updatedSubtasks;
                    refreshTable();
                });
            }
        };
        btnDelete.onclick = () => deleteTask(task, refreshTable);

        btnEdit.onclick = () => {
            enterEditMode(row, task, cellInfo, actionsWrapper, refreshTable);
        };

        actionsWrapper.append(btnEdit, btnComplete, btnDelete);
    }
    cellActions.appendChild(actionsWrapper);

    row.innerHTML = cellStatus + cellInfo + cellUrgency + cellDeadline;
    row.appendChild(cellActions);

    const overdueCheckbox = row.querySelector('.deadline-checkbox');
    if (overdueCheckbox) {
        overdueCheckbox.addEventListener('change', () => {
             if(confirm("O prazo terminou. Marcar como completa?")) {
                const timestamp = Date.now();
                const updatedSubtasks = (task.subTasks || []).map(st => ({ ...st, completed: true }));
                ApiService.updateTask(task.id || task._id, { 
                    status: `Completed_${timestamp}`,
                    subTasks: updatedSubtasks
                }).then(() => {
                    task.status = `Completed_${timestamp}`;
                    task.subTasks = updatedSubtasks;
                    refreshTable();
                });
             } else {
                 overdueCheckbox.checked = false;
             }
        });
    }

    tbody.appendChild(row);
  });

  tableWrapper.appendChild(table);
  container.appendChild(tableWrapper);
  return container;
}


// --- FUNÇÕES AUXILIARES ---

function createBtn(icon, title, className) {
    const btn = document.createElement("button");
    btn.innerHTML = icon;
    btn.title = title;
    btn.className = className;
    btn.style.padding = "5px 10px";
    btn.style.fontSize = "1rem";
    return btn;
}

function updateTaskStatus(task, newStatus, callback) {
    ApiService.updateTask(task.id || task._id, { status: newStatus })
        .then(() => {
            task.status = newStatus;
            callback();
        });
}

function deleteTask(task, callback) {
    if (confirm("Tem a certeza que deseja apagar esta tarefa?")) {
        const delStatus = `Deleted_${Date.now()}`;
        ApiService.updateTask(task.id || task._id, { status: delStatus })
            .then(() => {
                task.status = delStatus;
                callback();
            });
    }
}

function enterEditMode(row, task, originalInfoHTML, actionsWrapper, callback) {
    const infoCell = row.querySelector('.task-info');
    
    infoCell.innerHTML = `
        <input type="text" id="edit-title" value="${task.title}" class="input-style" style="width: 100%; margin-bottom: 5px; font-weight: bold;">
        <textarea id="edit-desc" class="input-style" style="width: 100%; resize: vertical;">${task.description || ""}</textarea>
        <div id="edit-subtasks-list" style="margin-top: 10px;"></div>
        <button id="btn-add-subtask" class="button-style">+ Adicionar Sub-tarefa</button>
    `;

    const subListDiv = infoCell.querySelector('#edit-subtasks-list');
    let currentSubtasks = [...(task.subTasks || [])];

    const renderSubInputs = () => {
        subListDiv.innerHTML = "";
        currentSubtasks.forEach((st, index) => {
            const div = document.createElement('div');
            div.style.display = "flex";
            div.style.alignItems = "center";
            div.style.gap = "5px";
            div.style.marginBottom = "5px";

            div.innerHTML = `
                <input type="checkbox" ${st.completed ? 'checked' : ''} id="chk-${index}">
                <input type="text" value="${st.title}" id="txt-${index}" style="flex:1;">
                <button type="button" data-idx="${index}" id="btn-remove-sub" class="button-style danger" style="color:red;">×</button>
            `;
            subListDiv.appendChild(div);
        });

        subListDiv.querySelectorAll('#btn-remove-sub').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = e.target.getAttribute('data-idx');
                currentSubtasks.splice(idx, 1);
                renderSubInputs();
            });
        });
    };

    renderSubInputs();

    infoCell.querySelector('#btn-add-subtask').addEventListener('click', () => {
        currentSubtasks.push({ title: "Nova sub-tarefa", completed: false });
        renderSubInputs();
    });

    const originalButtons = actionsWrapper.innerHTML;
    actionsWrapper.innerHTML = "";

    const btnConfirm = createBtn("✓", "Confirmar", "button-style success");
    const btnCancel = createBtn("✕", "Cancelar", "button-style danger");

    btnCancel.onclick = () => {
        callback();
    };

    btnConfirm.onclick = () => {
        const newTitle = infoCell.querySelector('#edit-title').value;
        const newDesc = infoCell.querySelector('#edit-desc').value;
        
        const newSubtasks = currentSubtasks.map((st, i) => ({
            title: subListDiv.querySelector(`#txt-${i}`).value,
            completed: subListDiv.querySelector(`#chk-${i}`).checked
        }));

        const updatedData = {
            title: newTitle,
            description: newDesc,
            subTasks: newSubtasks
        };

        ApiService.updateTask(task.id || task._id, updatedData)
            .then(() => {
                task.title = newTitle;
                task.description = newDesc;
                task.subTasks = newSubtasks;
                callback();
            });
    };

    actionsWrapper.append(btnConfirm, btnCancel);
}