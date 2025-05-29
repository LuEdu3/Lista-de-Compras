// Estado da aplicação
let shoppingList = [];
let currentFilter = 'all';
let editingItem = null;
let currentListId = null;
let userLists = [];

// Elementos DOM
const elements = {
    form: document.getElementById('addItemForm'),
    itemName: document.getElementById('itemName'),
    itemQuantity: document.getElementById('itemQuantity'),
    itemPrice: document.getElementById('itemPrice'),
    shoppingList: document.getElementById('shoppingList'),
    emptyState: document.getElementById('emptyState'),
    totalItems: document.querySelector('.total-items'),
    totalPrice: document.querySelector('.total-price'),
    summaryItems: document.getElementById('summaryItems'),
    summaryCompleted: document.getElementById('summaryCompleted'),
    summaryTotal: document.getElementById('summaryTotal'),
    clearCompleted: document.getElementById('clearCompleted'),
    clearAll: document.getElementById('clearAll'),
    categoryBtns: document.querySelectorAll('.category-btn'),
    categoryModal: document.getElementById('categoryModal'),
    closeCategoryModal: document.getElementById('closeCategoryModal'),
    categoryOptions: document.querySelectorAll('.category-option'),
    listSelectionScreen: document.getElementById('listSelectionScreen'),
    userLists: document.getElementById('userLists'),
    createListForm: document.getElementById('createListForm'),
    newListName: document.getElementById('newListName'),
    header: document.querySelector('.header'),
    addItemSection: document.querySelector('.add-item-section'),
    categoriesSection: document.querySelector('.categories-section'),
    shoppingListContainer: document.querySelector('.shopping-list-container'),
    summarySection: document.querySelector('.summary-section'),
    backToListsBtn: document.getElementById('backToListsBtn'),
    openCreateListModalBtn: document.getElementById('openCreateListModalBtn'),
    createListModal: document.getElementById('createListModal'),
    closeCreateListModal: document.getElementById('closeCreateListModal'),
    cancelCreateListModal: document.getElementById('cancelCreateListModal'),
    createListModalForm: document.getElementById('createListModalForm'),
    modalNewListName: document.getElementById('modalNewListName')
};

// Dados das categorias
const categories = {
    frutas: { icon: 'fas fa-apple-alt', color: '#ff5722' },
    verduras: { icon: 'fas fa-leaf', color: '#4caf50' },
    carnes: { icon: 'fas fa-drumstick-bite', color: '#795548' },
    laticinios: { icon: 'fas fa-cheese', color: '#ffc107' },
    padaria: { icon: 'fas fa-bread-slice', color: '#ff9800' },
    limpeza: { icon: 'fas fa-spray-can', color: '#2196f3' },
    bebidas: { icon: 'fas fa-wine-bottle', color: '#9c27b0' },
    outros: { icon: 'fas fa-box', color: '#607d8b' }
};

// Inicialização
document.addEventListener('DOMContentLoaded', function () {
    loadListsFromStorage();
    showListSelectionScreen();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Formulário de adicionar item
    elements.form.addEventListener('submit', handleAddItem);

    // Botões de categoria
    elements.categoryBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            setActiveCategory(btn.dataset.category);
        });
    });

    // Botões de ação
    elements.clearCompleted.addEventListener('click', clearCompletedItems);
    elements.clearAll.addEventListener('click', clearAllItems);

    // Modal de categoria
    elements.closeCategoryModal.addEventListener('click', closeModal);
    elements.categoryModal.addEventListener('click', (e) => {
        if (e.target === elements.categoryModal) {
            closeModal();
        }
    });

    elements.categoryOptions.forEach(option => {
        option.addEventListener('click', () => {
            selectCategory(option.dataset.value);
        });
    });

    // Auto-save quando sair da página
    window.addEventListener('beforeunload', saveToStorage);

    // Detectar quando o usuário está digitando para sugerir categoria
    elements.itemName.addEventListener('input', suggestCategory);

    // Listas
    elements.createListForm.addEventListener('submit', handleCreateList);
    elements.userLists.addEventListener('click', handleSelectList);

    // Botão de voltar para listas
    if (elements.backToListsBtn) {
        elements.backToListsBtn.addEventListener('click', showListSelectionScreen);
    }

    // Modal de criação de lista
    elements.openCreateListModalBtn.addEventListener('click', openCreateListModal);
    elements.closeCreateListModal.addEventListener('click', closeCreateListModalFn);
    elements.cancelCreateListModal.addEventListener('click', closeCreateListModalFn);

    // Fechar modal com ESC
    elements.createListModal.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeCreateListModalFn();
        }
    });

    // Submeter criação de lista
    elements.createListModalForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = elements.modalNewListName.value.trim();
        if (name) {
            // Função para criar lista (deve existir no seu código)
            createNewList(name);
            closeCreateListModalFn();
        } else {
            elements.modalNewListName.focus();
        }
    });
}

// Funções principais
function handleAddItem(e) {
    e.preventDefault();

    const name = elements.itemName.value.trim();
    const quantity = parseInt(elements.itemQuantity.value) || 1;
    const price = parseFloat(elements.itemPrice.value) || 0;

    if (!name) {
        showNotification('Digite o nome do produto', 'error');
        return;
    }

    if (editingItem) {
        updateItem(editingItem, name, quantity, price);
        editingItem = null;
        elements.form.querySelector('button').innerHTML = '<i class="fas fa-plus"></i> Adicionar';
    } else {
        addItem(name, quantity, price);
    }

    elements.form.reset();
    elements.itemQuantity.value = 1;
    updateDisplay();
    updateSummary();
    saveToStorage();
}

function addItem(name, quantity, price) {
    const category = detectCategory(name);
    const item = {
        id: Date.now(),
        name: name,
        quantity: quantity,
        price: price,
        category: category,
        completed: false,
        dateAdded: new Date().toISOString()
    };

    shoppingList.unshift(item);
    showNotification('Item adicionado com sucesso!', 'success');
}

function updateItem(id, name, quantity, price) {
    const item = shoppingList.find(item => item.id === id);
    if (item) {
        item.name = name;
        item.quantity = quantity;
        item.price = price;
        item.category = detectCategory(name);
        showNotification('Item atualizado com sucesso!', 'success');
    }
}

function deleteItem(id) {
    if (confirm('Tem certeza que deseja excluir este item?')) {
        shoppingList = shoppingList.filter(item => item.id !== id);
        updateDisplay();
        updateSummary();
        saveToStorage();
        showNotification('Item excluído', 'success');
    }
}

function toggleItemCompleted(id) {
    const item = shoppingList.find(item => item.id === id);
    if (item) {
        item.completed = !item.completed;
        updateDisplay();
        updateSummary();
        saveToStorage();

        const message = item.completed ? 'Item marcado como concluído' : 'Item desmarcado';
        showNotification(message, 'success');
    }
}

function editItem(id) {
    const item = shoppingList.find(item => item.id === id);
    if (item) {
        elements.itemName.value = item.name;
        elements.itemQuantity.value = item.quantity;
        elements.itemPrice.value = item.price;

        editingItem = id;
        elements.form.querySelector('button').innerHTML = '<i class="fas fa-save"></i> Salvar';

        elements.itemName.focus();
        elements.itemName.scrollIntoView({ behavior: 'smooth' });
    }
}

function clearCompletedItems() {
    const completedCount = shoppingList.filter(item => item.completed).length;

    if (completedCount === 0) {
        showNotification('Não há itens concluídos para remover', 'info');
        return;
    }

    if (confirm(`Remover ${completedCount} item(s) concluído(s)?`)) {
        shoppingList = shoppingList.filter(item => !item.completed);
        updateDisplay();
        updateSummary();
        saveToStorage();
        showNotification(`${completedCount} item(s) removido(s)`, 'success');
    }
}

function clearAllItems() {
    if (shoppingList.length === 0) {
        showNotification('A lista já está vazia', 'info');
        return;
    }

    if (confirm('Tem certeza que deseja limpar toda a lista?')) {
        shoppingList = [];
        updateDisplay();
        updateSummary();
        saveToStorage();
        showNotification('Lista limpa com sucesso', 'success');
    }
}

// Funções de exibição
function updateDisplay() {
    const filteredItems = getFilteredItems();

    if (filteredItems.length === 0) {
        elements.shoppingList.innerHTML = '';
        elements.emptyState.classList.remove('hidden');
    } else {
        elements.emptyState.classList.add('hidden');
        elements.shoppingList.innerHTML = filteredItems.map(createItemHTML).join('');

        // Adicionar event listeners aos novos elementos
        addItemEventListeners();
    }
}

function createItemHTML(item) {
    const category = categories[item.category] || categories.outros;
    const totalPrice = (item.quantity * item.price).toFixed(2);

    return `
        <li class="shopping-item ${item.completed ? 'completed' : ''}" data-id="${item.id}">
            <input type="checkbox" 
                   class="item-checkbox" 
                   ${item.completed ? 'checked' : ''}
                   onchange="toggleItemCompleted(${item.id})">
            
            <div class="item-details">
                <div class="item-name">${escapeHtml(item.name)}</div>
                <div class="item-meta">
                    <span class="item-quantity">Qtd: ${item.quantity}</span>
                    ${item.price > 0 ? `<span class="item-price">R$ ${item.price.toFixed(2)}</span>` : ''}
                    ${item.price > 0 ? `<span class="item-total">Total: R$ ${totalPrice}</span>` : ''}
                    <span class="item-category" style="color: ${category.color}">
                        <i class="${category.icon}"></i> ${item.category}
                    </span>
                </div>
            </div>
            
            <div class="item-actions">
                <button class="item-btn edit" onclick="editItem(${item.id})" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="item-btn delete" onclick="deleteItem(${item.id})" title="Excluir">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </li>
    `;
}

function addItemEventListeners() {
    // Os event listeners são adicionados inline no HTML para simplificar
    // Em uma aplicação maior, seria melhor usar addEventListener
}

function updateSummary() {
    const totalItems = shoppingList.length;
    const completedItems = shoppingList.filter(item => item.completed).length;
    const totalValue = shoppingList.reduce((sum, item) => {
        return sum + (item.quantity * item.price);
    }, 0);

    // Atualizar header
    elements.totalItems.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`;
    elements.totalPrice.textContent = `R$ ${totalValue.toFixed(2)}`;

    // Atualizar resumo
    elements.summaryItems.textContent = totalItems;
    elements.summaryCompleted.textContent = completedItems;
    elements.summaryTotal.textContent = `R$ ${totalValue.toFixed(2)}`;
}

// Funções de filtro
function setActiveCategory(category) {
    currentFilter = category;

    elements.categoryBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });

    updateDisplay();
}

function getFilteredItems() {
    if (currentFilter === 'all') {
        return shoppingList;
    }
    return shoppingList.filter(item => item.category === currentFilter);
}

// Funções utilitárias
function detectCategory(itemName) {
    const name = itemName.toLowerCase();

    const categoryKeywords = {
        frutas: ['maçã', 'banana', 'laranja', 'uva', 'pêra', 'mamão', 'abacaxi', 'melancia', 'melão', 'morango', 'kiwi', 'manga', 'limão', 'abacate'],
        verduras: ['alface', 'tomate', 'cebola', 'cenoura', 'batata', 'abobrinha', 'brócolis', 'couve', 'espinafre', 'rúcula', 'pepino', 'pimentão', 'beterraba'],
        carnes: ['carne', 'frango', 'peixe', 'porco', 'boi', 'linguiça', 'salsicha', 'bacon', 'presunto', 'mortadela', 'peito de peru'],
        laticinios: ['leite', 'queijo', 'iogurte', 'manteiga', 'creme de leite', 'requeijão', 'mussarela', 'parmesão', 'ricota'],
        padaria: ['pão', 'bolo', 'biscoito', 'torrada', 'croissant', 'sonho', 'donut', 'rosquinha'],
        limpeza: ['detergente', 'sabão', 'amaciante', 'desinfetante', 'álcool', 'papel higiênico', 'guardanapo', 'esponja'],
        bebidas: ['água', 'refrigerante', 'suco', 'cerveja', 'vinho', 'café', 'chá', 'energético', 'isotônico']
    };

    for (const [category, keywords] of Object.entries(categoryKeywords)) {
        if (keywords.some(keyword => name.includes(keyword))) {
            return category;
        }
    }

    return 'outros';
}

function suggestCategory() {
    const name = elements.itemName.value.trim();
    if (name.length > 2) {
        const suggestedCategory = detectCategory(name);
        if (suggestedCategory !== 'outros') {
            // Opcional: destacar a categoria sugerida
            const categoryBtn = document.querySelector(`[data-category="${suggestedCategory}"]`);
            if (categoryBtn) {
                categoryBtn.style.animation = 'pulse 0.5s ease';
                setTimeout(() => {
                    categoryBtn.style.animation = '';
                }, 500);
            }
        }
    }
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showNotification(message, type = 'info') {
    // Criar elemento de notificação
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;

    // Adicionar estilos
    Object.assign(notification.style, {
        position: 'fixed',
        top: '80px',
        right: '1rem',
        background: getNotificationColor(type),
        color: 'white',
        padding: '0.75rem 1rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        zIndex: '3000',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        minWidth: '200px',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease'
    });

    document.body.appendChild(notification);

    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);

    // Remover após 3 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
    };
    return colors[type] || colors.info;
}

// Funções de modal
function openModal() {
    elements.categoryModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    elements.categoryModal.classList.remove('active');
    document.body.style.overflow = '';
}

function selectCategory(category) {
    setActiveCategory(category);
    closeModal();
}

// Modal de criação de lista
function openCreateListModal() {
    elements.createListModal.classList.add('active');
    elements.createListModal.setAttribute('aria-hidden', 'false');
    setTimeout(() => elements.modalNewListName.focus(), 100);
}

function closeCreateListModalFn() {
    elements.createListModal.classList.remove('active');
    elements.createListModal.setAttribute('aria-hidden', 'true');
    elements.openCreateListModalBtn.focus();
    elements.createListModalForm.reset();
}

elements.openCreateListModalBtn.addEventListener('click', openCreateListModal);
elements.closeCreateListModal.addEventListener('click', closeCreateListModalFn);
elements.cancelCreateListModal.addEventListener('click', closeCreateListModalFn);

// Fechar modal com ESC
elements.createListModal.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeCreateListModalFn();
    }
});

// Submeter criação de lista
elements.createListModalForm.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = elements.modalNewListName.value.trim();
    if (name) {
        // Função para criar lista (deve existir no seu código)
        createNewList(name);
        closeCreateListModalFn();
    } else {
        elements.modalNewListName.focus();
    }
});

// Funções de persistência
function saveToStorage() {
    if (!currentListId) return;
    const data = {
        shoppingList: shoppingList,
        currentFilter: currentFilter,
        lastSaved: new Date().toISOString()
    };
    localStorage.setItem('shoppingListApp_' + currentListId, JSON.stringify(data));
}

function loadFromStorage() {
    if (!currentListId) return;
    const data = localStorage.getItem('shoppingListApp_' + currentListId);
    if (data) {
        const parsed = JSON.parse(data);
        shoppingList = parsed.shoppingList || [];
        currentFilter = parsed.currentFilter || 'all';
        setActiveCategory(currentFilter);
    } else {
        shoppingList = [];
        currentFilter = 'all';
        setActiveCategory('all');
    }
}

// Funções de listas
function handleCreateList(e) {
    e.preventDefault();
    const name = elements.newListName.value.trim();
    if (!name) return;
    const id = Date.now().toString();
    userLists.push({ id, name });
    saveListsToStorage();
    renderUserLists();
    elements.newListName.value = '';
}

function handleSelectList(e) {
    if (e.target.tagName === 'LI' || e.target.closest('li')) {
        const li = e.target.closest('li');
        const listId = li.dataset.id;
        openList(listId);
    }
}

function openList(listId) {
    currentListId = listId;
    loadFromStorage();
    showMainScreen();
    updateDisplay();
    updateSummary();
}

function showListSelectionScreen() {
    elements.listSelectionScreen.style.display = 'flex';
    elements.header.style.display = 'none';
    elements.addItemSection.style.display = 'none';
    elements.categoriesSection.style.display = 'none';
    elements.shoppingListContainer.style.display = 'none';
    elements.summarySection.style.display = 'none';
    if (elements.backToListsBtn) elements.backToListsBtn.style.display = 'none';
    renderUserLists();
}

function showMainScreen() {
    elements.listSelectionScreen.style.display = 'none';
    elements.header.style.display = '';
    elements.addItemSection.style.display = '';
    elements.categoriesSection.style.display = '';
    elements.shoppingListContainer.style.display = '';
    elements.summarySection.style.display = '';
    if (elements.backToListsBtn) elements.backToListsBtn.style.display = '';
}

function renderUserLists() {
    elements.userLists.innerHTML = userLists.map(list => `
        <li class="list-card" data-id="${list.id}">
            <div class="list-card-title">${escapeHtml(list.name)}</div>
        </li>
    `).join('');
}

function saveListsToStorage() {
    localStorage.setItem('shoppingListsMeta', JSON.stringify(userLists));
}

function loadListsFromStorage() {
    const data = localStorage.getItem('shoppingListsMeta');
    userLists = data ? JSON.parse(data) : [];
}

// Adicionar CSS para animação de pulse
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Tornar funções globais para os event handlers inline
window.toggleItemCompleted = toggleItemCompleted;
window.editItem = editItem;
window.deleteItem = deleteItem;