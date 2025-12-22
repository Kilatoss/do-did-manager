import { ApiService } from '../services/api.js';
import { AppStore } from '../app.js';

export function openCreateTaskModal(categoryId, onSuccess) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    // HTML do Modal
    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-card" style="max-width: 500px;">
                <h2 class="modal-title">Nova Tarefa</h2>
                
                <div class="input-group">
                    <label class="input-label">Tarefa</label>
                    <input type="text" id="task-title" placeholder="Ex: Finalizar relatório...">
                </div>
                
                <div class="input-group">
                    <label class="input-label">Descrição</label>
                    <textarea id="task-desc" rows="3" placeholder="Detalhes da tarefa..."></textarea>
                </div>

                <div style="display: flex; gap: 15px;">
                    <div class="input-group" style="flex: 1;">
                        <label class="input-label">Urgência</label>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span id="urgency-preview" class="urgency-dot urgency-low"></span>
                            <select id="task-urgency" style="flex: 1; padding: 8px; border-radius: 5px; border: 1px solid #444; background: #222; color: white;">
                                <option value="Normal">Default (Normal)</option>
                                <option value="Baixa">Pouca</option>
                                <option value="Amarelo">Média</option>
                                <option value="Vermelho">Alta</option>
                            </select>
                        </div>
                    </div>

                    <div class="input-group" style="flex: 1;">
                        <label class="input-label">Prazo (Deadline)</label>
                        <input type="datetime-local" id="task-deadline">
                    </div>
                </div>

                <div class="input-group" style="margin-top: 10px;">
                    <label style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                        <input type="checkbox" id="check-subtasks"> 
                        <span class="input-label">Adicionar Sub-tarefas</span>
                    </label>
                </div>

                <div id="subtasks-area" style="display: none; border-left: 2px solid #444; padding-left: 10px; margin-bottom: 15px;">
                    <div id="subtasks-list">
                        </div>
                    <button id="btn-add-subtask" type="button" class="btn-small-add">+ Adicionar item</button>
                </div>

                <p id="task-error" style="color: red; display: none; font-size: 0.9rem; margin-bottom: 10px;"></p>

                <div class="modal-actions">
                    <button id="btn-cancel" class="button-style">Cancelar</button>
                    <button id="btn-confirm-task" class="button-style">Criar Tarefa</button>
                </div>
            </div>
        </div>
    `;

    // --- LÓGICA DO DOM ---

    // 1. Controle visual da cor de urgência
    const urgencySelect = document.getElementById('task-urgency');
    const urgencyDot = document.getElementById('urgency-preview');
    
    urgencySelect.addEventListener('change', (e) => {
        const val = e.target.value;
        urgencyDot.className = 'urgency-dot'; // reset
        
        if (val === 'Vermelho') urgencyDot.classList.add('urgency-high');       // Vermelho
        else if (val === 'Amarelo') urgencyDot.classList.add('urgency-medium'); // Amarelo
        else if (val === 'Baixa') urgencyDot.classList.add('urgency-low');      // Verde (ou similar)
        else urgencyDot.classList.add('urgency-low');                           // Cinza/Default
    });

    // 2. Mostrar/Esconder Subtarefas
    const checkSub = document.getElementById('check-subtasks');
    const subArea = document.getElementById('subtasks-area');
    const subList = document.getElementById('subtasks-list');
    const btnAddSub = document.getElementById('btn-add-subtask');

    checkSub.addEventListener('change', (e) => {
        subArea.style.display = e.target.checked ? 'block' : 'none';
        if (e.target.checked && subList.children.length === 0) {
            addNewSubtaskInput(); // Adiciona um campo automaticamente se estiver vazio
        }
    });

    // 3. Adicionar input de subtarefa dinâmico
    function addNewSubtaskInput() {
        const div = document.createElement('div');
        div.style.marginBottom = '5px';
        div.style.display = 'flex';
        
        div.innerHTML = `
            <input type="text" class="subtask-input" placeholder="Nome da sub-tarefa" style="flex: 1;">
            <button type="button" class="remove-sub" style="margin-left: 5px; background: none; border: none; color: #ff5555; cursor: pointer;">✕</button>
        `;

        // Remover linha
        div.querySelector('.remove-sub').addEventListener('click', () => div.remove());
        subList.appendChild(div);
        
        // Focar no novo input
        div.querySelector('input').focus();
    }

    btnAddSub.addEventListener('click', addNewSubtaskInput);


    // 4. Fechar Modal
    const closeModal = () => modalContainer.innerHTML = '';
    document.getElementById('btn-cancel').addEventListener('click', closeModal);

    // 5. SALVAR TAREFA
    document.getElementById('btn-confirm-task').addEventListener('click', async () => {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const urgency = urgencySelect.value;
        const deadlineInput = document.getElementById('task-deadline').value;
        const errorMsg = document.getElementById('task-error');

        if (!title) {
            errorMsg.textContent = "A tarefa precisa de um nome.";
            errorMsg.style.display = 'block';
            return;
        }

        // Recolher Subtarefas
        let subTasks = [];
        if (checkSub.checked) {
            const inputs = subList.querySelectorAll('.subtask-input');
            inputs.forEach(input => {
                if (input.value.trim()) {
                    subTasks.push({ title: input.value.trim(), completed: false });
                }
            });
        }

        const defaultDate = "1970-01-01T12:00:00.000+00:00";
        const finalDeadline = deadlineInput ? deadlineInput : defaultDate;

        const newTaskPayload = {
            userId: AppStore.currentUser._id || AppStore.currentUser.user._id,
            categoryId: categoryId,
            title,
            description,
            urgency,
            deadline: finalDeadline,
            subTasks
        };

        const response = await ApiService.createTask(newTaskPayload);

        if (response.success) {
            onSuccess(response.task); // Callback para atualizar a UI
            closeModal();
        } else {
            errorMsg.textContent = response.message;
            errorMsg.style.display = 'block';
        }
    });
}