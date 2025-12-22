import { ApiService } from '../services/api.js';
import { AppStore } from '../app.js';

const COLORS = [
    '#E74C3C', 
    '#E67E22', 
    '#F1C40F', 
    '#2ECC71', 
    '#16A085', 
    '#3498DB', 
    '#9B59B6', 
    '#ad448dff', 
    '#34495E', 
    '#E91E63', 
    '#1ABC9C', 
    '#95A5A6'  
];

export function openCreateCategoryModal(onSuccessCallback) {
    const modalContainer = document.getElementById('modal-container');
    if (!modalContainer) return;

    const colorOptionsHTML = COLORS.map((color, index) => `
        <div class="color-option ${index === 0 ? 'selected' : ''}" 
             style="background-color: ${color};" 
             data-color="${color}">
             ${index === 0 ? '✓' : ''}
        </div>
    `).join('');

    modalContainer.innerHTML = `
        <div class="modal-overlay">
            <div class="modal-card">
                <h2>Nova Categoria</h2>
                <p>Crie um espaço para organizar as suas tarefas.</p>
                
                <div class="input-group">
                    <label>Título</label>
                    <input type="text" id="cat-name" placeholder="Ex: Trabalho, Estudos...">
                </div>
                
                <div class="input-group">
                    <label>Descrição</label>
                    <input type="text" id="cat-desc" placeholder="Opcional">
                </div>

                <div class="input-group">
                    <label>Cor de Destaque</label>
                    <div class="color-grid">
                        ${colorOptionsHTML}
                    </div>
                </div>

                <p id="cat-error" style="color: red; display: none; font-size: 0.9rem; margin-top: 10px;"></p>

                <div class="modal-actions">
                    <button id="btn-cancel-cat" class="button-style danger">Cancelar</button>
                    <button id="btn-confirm-cat" class="button-style">Criar</button>
                </div>
            </div>
        </div>
    `;

    let selectedColor = COLORS[0];

    const colorDivs = modalContainer.querySelectorAll('.color-option');
    colorDivs.forEach(div => {
        div.addEventListener('click', () => {
            colorDivs.forEach(d => {
                d.classList.remove('selected');
                d.innerHTML = '';
            });

            div.classList.add('selected');
            div.innerHTML = '✓';
            selectedColor = div.dataset.color;
        });
    });
    
    const closeModal = () => modalContainer.innerHTML = '';
    modalContainer.querySelector('#btn-cancel-cat').addEventListener('click', closeModal);
    modalContainer.querySelector('#btn-confirm-cat').addEventListener('click', async () => {
        const name = document.getElementById('cat-name').value;
        const description = document.getElementById('cat-desc').value;
        const errorMsg = document.getElementById('cat-error');

        if (!name) {
            errorMsg.textContent = "O título é obrigatório.";
            errorMsg.style.display = 'block';
            return;
        }

        const payload = {
            userId: AppStore.currentUser._id,
            name,
            description,
            color: selectedColor
        };

        const response = await ApiService.createCategory(payload);

        if (response.success) {
            closeModal();
            if (onSuccessCallback) onSuccessCallback(response.category);
        } else {
            errorMsg.textContent = response.message || "Erro ao criar.";
            errorMsg.style.display = 'block';
        }
    });
}