// Estado da aplicação
let shoppingList = [];
let currentFilter = 'all';
let editingItem = null;
let currentListId = null; // ID da lista atualmente aberta
let userLists = []; // Array para armazenar as listas de compras do usuário
let selectedCategory = 'geral'; // Categoria padrão
let categoriaSelecionadaManualmente = false; // Flag para controle de seleção manual de categoria

// Elementos DOM
const elements = {
    form: document.getElementById('addItemForm'),
    itemName: document.getElementById('itemName'),
    itemQuantity: document.getElementById('itemQuantity'),
    itemPrice: document.getElementById('itemPrice'),
    shoppingList: document.getElementById('shoppingList'),
    emptyState: document.getElementById('emptyState'),
    totalItems: document.getElementById('totalItems'),
    totalPrice: document.getElementById('totalPrice'),
    summaryItems: document.getElementById('summaryItems'),
    summaryCompleted: document.getElementById('summaryCompleted'),
    summaryTotal: document.getElementById('summaryTotal'),
    clearCompleted: document.getElementById('clearCompleted'),
    clearAll: document.getElementById('clearAll'),
    categoryBtns: document.querySelectorAll('.category-btn'),    categoryModal: document.getElementById('categoryModal'),
    closeCategoryModal: document.getElementById('closeCategoryModal'),
    categoryOptions: document.querySelectorAll('.category-option'),
    openCategoryModalBtn: document.getElementById('openCategoryModalBtn'),
    categoryFilter: document.getElementById('categoryFilter'),
    notificationContainer: document.getElementById('notificationContainer'),


    // Elementos da Tela de Seleção de Listas
    listSelectionScreen: document.getElementById('listSelectionScreen'),
    userListsContainer: document.getElementById('userLists'), // Renomeado para evitar conflito com 'userLists' array
    openCreateListModalBtn: document.getElementById('openCreateListModalBtn'),
    createListModal: document.getElementById('createListModal'),
    closeCreateListModalBtn: document.getElementById('closeCreateListModalBtn'),
    createListForm: document.getElementById('createListForm'),
    newListName: document.getElementById('newListName'),
    modalOverlay: document.querySelector('.modal-overlay'), // Para fechar qualquer modal

    // Elementos da Tela Principal
    mainScreen: document.getElementById('mainScreen'),
    currentListName: document.getElementById('currentListName'), // Título da lista atual
    backToListsBtn: document.getElementById('backToListsBtn'), // Botão de voltar
};



// Funções de Utilitário
function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.classList.add('notification', type);
    notification.innerHTML = `
        <span class="icon">
            ${type === 'success' ? '<i class="fas fa-check-circle"></i>' :
            type === 'error' ? '<i class="fas fa-times-circle"></i>' :
                type === 'warning' ? '<i class="fas fa-exclamation-triangle"></i>' :
                    '<i class="fas fa-info-circle"></i>'}
        </span>
        <span class="message">${message}</span>
        <button class="close-btn">&times;</button>
    `;
    elements.notificationContainer.appendChild(notification);

    // DEBUG: Notificação criada
    console.debug(`[DEBUG] Notificação (${type}):`, message);

    setTimeout(() => notification.style.opacity = '1', 10);

    notification.querySelector('.close-btn').addEventListener('click', () => {
        // DEBUG: Notificação fechada manualmente
        console.debug('[DEBUG] Notificação fechada manualmente:', message);
        hideNotification(notification);
    });

    setTimeout(() => {
        // DEBUG: Notificação fechada automaticamente
        console.debug('[DEBUG] Notificação fechada automaticamente:', message);
        hideNotification(notification);
    }, 5000);
}

function hideNotification(notification) {
    notification.style.opacity = '0';
    let removed = false;
    // Remove após a transição
    notification.addEventListener('transitionend', () => {
        if (!removed) {
            notification.remove();
            removed = true;
        }
    }, { once: true });
    // Fallback: remove após 600ms caso a transição não dispare
    setTimeout(() => {
        if (!removed && document.body.contains(notification)) {
            notification.remove();
        }
    }, 600);
}

// Funções de Manipulação de Telas
function showListSelectionScreen() {
    elements.listSelectionScreen.classList.add('active');
    elements.listSelectionScreen.classList.remove('inactive');
    elements.mainScreen.classList.add('inactive');
    elements.mainScreen.classList.remove('active');
    currentListId = null; // Limpa o ID da lista atual
    updateListHeader(''); // Limpa o título da lista na mainScreen
    renderUserLists(); // Garante que as listas estejam atualizadas
}

function showMainScreen() {
    elements.mainScreen.classList.add('active');
    elements.mainScreen.classList.remove('inactive');
    elements.listSelectionScreen.classList.add('inactive');
    elements.listSelectionScreen.classList.remove('active');
}

function updateListHeader(name) {
    elements.currentListName.textContent = name || 'Lista de Compras';
}

// Funções de Persistência (API)
async function fetchLists() {
    try {
        const response = await fetch(`/api/listas?deviceId=${encodeURIComponent(deviceId)}`);
        const data = await response.json();
        if (data.success) {
            userLists = data.data;
        } else {
            showNotification('Erro ao carregar listas: ' + data.message, 'error');
            userLists = [];
        }
    } catch (error) {
        console.error('Erro de rede ao buscar listas:', error);
        showNotification('Erro de rede ao carregar listas.', 'error');
        userLists = [];
    }
}

async function createList(name) {
    try {
        const response = await fetch('/api/listas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, deviceId }) // Corrigido para enviar o nome correto
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Lista criada com sucesso!', 'success');
            await fetchLists(); // Recarrega todas as listas
            openShoppingList(data.listId, name); // Abre a lista recém-criada
        } else {
            showNotification('Erro ao criar lista: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao criar lista:', error);
        showNotification('Erro de rede ao criar lista.', 'error');
    }
}

async function deleteList(listId) {
    if (!confirm('Tem certeza que deseja excluir esta lista e todos os seus itens?')) {
        return;
    }
    try {
        const response = await fetch(`/api/listas/${listId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ deviceId }) // Corrigido para enviar o deviceId
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Lista excluída com sucesso!', 'success');
            await fetchLists(); // Recarrega as listas
            renderUserLists(); // Renderiza novamente a tela de seleção
        } else {
            showNotification('Erro ao excluir lista: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir lista:', error);
        showNotification('Erro de rede ao excluir lista.', 'error');
    }
}

async function fetchItems(listId) {
    try {
        const response = await fetch(`/api/listas/${listId}/itens`);
        const data = await response.json();
        if (data.success) {
            shoppingList = data.data;
        } else {
            showNotification('Erro ao carregar itens da lista: ' + data.message, 'error');
            shoppingList = [];
        }
    } catch (error) {
        console.error('Erro de rede ao buscar itens:', error);
        showNotification('Erro de rede ao carregar itens da lista.', 'error');
        shoppingList = [];
    }
}

async function addItem(item) {
    try {
        const response = await fetch(`/api/listas/${currentListId}/itens`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(item)
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Item adicionado!', 'success');
            await fetchItems(currentListId); // Recarrega os itens
            renderShoppingList();
        } else {
            showNotification('Erro ao adicionar item: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao adicionar item:', error);
        showNotification('Erro de rede ao adicionar item.', 'error');
    }
}

async function updateItem(itemId, updates) {
    try {
        const response = await fetch(`/api/itens/${itemId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Item atualizado!', 'success');
            await fetchItems(currentListId);
            renderShoppingList();
        } else {
            showNotification('Erro ao atualizar item: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao atualizar item:', error);
        showNotification('Erro de rede ao atualizar item.', 'error');
    }
}

async function deleteItem(itemId) {
    if (!confirm('Tem certeza que deseja excluir este item?')) {
        return;
    }
    try {
        const response = await fetch(`/api/itens/${itemId}`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Item excluído!', 'success');
            await fetchItems(currentListId);
            renderShoppingList();
        } else {
            showNotification('Erro ao excluir item: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao excluir item:', error);
        showNotification('Erro de rede ao excluir item.', 'error');
    }
}

async function clearCompletedItems() {
    if (!currentListId) return;
    try {
        const response = await fetch(`/api/listas/${currentListId}/itens/concluidos`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Itens concluídos removidos!', 'success');
            await fetchItems(currentListId);
            renderShoppingList();
        } else {
            showNotification('Erro ao limpar itens concluídos: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao limpar itens concluídos:', error);
        showNotification('Erro de rede ao limpar itens concluídos.', 'error');
    }
}

async function clearAllItems() {
    if (!currentListId) return;
    if (!confirm('Tem certeza que deseja limpar TODOS os itens desta lista?')) {
        return;
    }
    try {
        const response = await fetch(`/api/listas/${currentListId}/itens`, {
            method: 'DELETE'
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Lista limpa com sucesso!', 'success');
            await fetchItems(currentListId);
            renderShoppingList();
        } else {
            showNotification('Erro ao limpar a lista: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erro ao limpar a lista:', error);
        showNotification('Erro de rede ao limpar a lista.', 'error');
    }
}

// Funções de Renderização
function renderUserLists() {
    elements.userListsContainer.innerHTML = ''; // Limpa a lista existente

    if (userLists.length === 0) {
        elements.userListsContainer.innerHTML = `
            <li class="empty-state-list">
                <i class="fas fa-folder-open empty-icon"></i>
                <p>Nenhuma lista criada ainda.</p>
                <p>Use o botão "Criar Nova Lista" para começar!</p>
            </li>
        `;
        return;
    }

    userLists.forEach(list => {
        const li = document.createElement('li');
        li.classList.add('list-card');
        li.dataset.id = list.id;

        // <span class="list-card-meta">ID: ${list.id}</span> Exibe o ID na lista
        li.innerHTML = `
            <div class="list-card-info">
                <span class="list-card-name">${list.nome}</span>
            </div>
            <div class="list-card-actions">
                <button class="edit-list-btn" aria-label="Renomear lista">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="delete-list-btn" aria-label="Excluir lista">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;

        // Evento para abrir a lista
        li.querySelector('.list-card-info').addEventListener('click', () => {
            openShoppingList(list.id, list.nome);
        });

        // Evento para renomear lista
        li.querySelector('.edit-list-btn').addEventListener('click', async (e) => {
            e.stopPropagation(); // Evita que o clique propague para o card
            const newName = prompt('Novo nome para a lista:', list.nome);
            if (newName && newName.trim() !== '' && newName !== list.nome) {
                await updateListName(list.id, newName.trim());
            } else if (newName !== null && newName.trim() === '') {
                showNotification('O nome da lista não pode ser vazio.', 'warning');
            }
        });

        // Evento para excluir lista
        li.querySelector('.delete-list-btn').addEventListener('click', (e) => {
            e.stopPropagation(); // Evita que o clique propague para o card
            deleteList(list.id);
        });

        elements.userListsContainer.appendChild(li);
    });
}

async function updateListName(listId, newName) {
    try {
        const response = await fetch(`/api/listas/${listId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, deviceId }) // Corrigido para enviar o deviceId
        });
        const data = await response.json();
        if (data.success) {
            showNotification('Lista renomeada com sucesso!', 'success');
            await fetchLists(); // Recarrega e renderiza as listas
            renderUserLists();
            // Se a lista renomeada estiver aberta, atualiza o cabeçalho
            if (currentListId === listId) {
                updateListHeader(newName);
            }
        } else {
            showNotification('Erro ao renomear lista: ' + data.message, 'error');
        }
    } catch (error) {
        console.error('Erro de rede ao renomear lista:', error);
        showNotification('Erro de rede ao renomear lista.', 'error');
    }
}

// Identificação por dispositivo (UUID salvo no localStorage)
let deviceId = localStorage.getItem('deviceId');
if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('deviceId', deviceId);
}

// Abre uma lista de compras específica
async function openShoppingList(listId, listName) {
    console.log(`Abrindo lista: ${listName} (ID: ${listId})`);
    currentListId = listId;
    updateListHeader(listName); // Atualiza o título na tela da lista

    await fetchItems(listId); // Carrega os itens para a lista selecionada
    renderShoppingList(); // Renderiza os itens
    showMainScreen(); // Mostra a tela principal
}


function renderShoppingList() {
    elements.shoppingList.innerHTML = '';
    const filteredList = shoppingList.filter(item => {
        if (currentFilter === 'all') return true;
        if (currentFilter === 'pending') return !item.concluido;
        if (currentFilter === 'completed') return item.concluido;
        if (elements.categoryFilter && elements.categoryFilter.value !== 'all') {
            return item.categoria === elements.categoryFilter.value;
        }
    });

    if (filteredList.length === 0) {
        elements.emptyState.style.display = 'block';
    } else {
        elements.emptyState.style.display = 'none';
    }

    filteredList.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('item');
        if (item.concluido) {
            li.classList.add('completed');
        }
        li.dataset.id = item.id;
        li.dataset.category = item.categoria || 'geral';

        li.innerHTML = `
            <div class="item-actions left">
                <button class="edit-btn" data-id="${item.id}">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
            <input type="checkbox" class="item-checkbox" ${item.concluido ? 'checked' : ''} data-id="${item.id}">
            <div class="item-info">
                <span class="item-name">${item.nome}</span>
                <span class="item-category-label">${item.categoria ? item.categoria.charAt(0).toUpperCase() + item.categoria.slice(1) : 'Geral'}</span>
                <span class="item-details">
                    Qtd: ${item.quantidade}
                </span>
            </div>
            <span class="item-price-display">${formatCurrency(item.preco * item.quantidade)}</span>
            <div class="item-actions right">
                <button class="delete-btn" data-id="${item.id}">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </div>
        `;

        elements.shoppingList.appendChild(li);

        // Adicionar eventos de swipe (touch) para editar/deletar
        let startX;
        let deltaX;
        let isSwiping = false;

        // Touch events com passive: true
        li.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            deltaX = 0;
            isSwiping = false;
            li.style.transition = 'none';
        }, { passive: true });
        li.addEventListener('touchmove', (e) => {
            deltaX = e.touches[0].clientX - startX;
            if (Math.abs(deltaX) > 20) {
                isSwiping = true;
                li.style.transform = `translateX(${deltaX}px)`;
            }
        }, { passive: true });
        li.addEventListener('touchend', () => {
            li.style.transition = 'transform 0.2s ease-out'; // Reabilita a transição
            if (isSwiping) {
                if (deltaX < -60) { // Deslizou para a esquerda (revelar delete)
                    li.classList.add('swipe-left');
                    li.classList.remove('swipe-right');
                    li.style.transform = `translateX(-80px)`; // Ajustar para o tamanho do botão
                } else if (deltaX > 60) { // Deslizou para a direita (revelar edit)
                    li.classList.add('swipe-right');
                    li.classList.remove('swipe-left');
                    li.style.transform = `translateX(80px)`; // Ajustar para o tamanho do botão
                } else {
                    li.classList.remove('swipe-left', 'swipe-right');
                    li.style.transform = `translateX(0)`;
                }
            }
            isSwiping = false;
        });

        // Evento para fechar swipe ao clicar fora do item
        li.addEventListener('click', (e) => {
            if (!e.target.closest('.item-actions')) {
                // Se o clique não foi nos botões de ação, feche o swipe
                li.classList.remove('swipe-left', 'swipe-right');
                li.style.transform = `translateX(0)`;
            }
        });


        // Eventos para desktop (mouse) para um efeito similar de swipe
        let mouseDownX;
        let mouseDeltaX;
        let isMouseDown = false;

        li.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Botão esquerdo do mouse
                mouseDownX = e.clientX;
                mouseDeltaX = 0;
                isMouseDown = true;
                li.style.transition = 'none';
            }
        });

        li.addEventListener('mousemove', (e) => {
            if (isMouseDown) {
                mouseDeltaX = e.clientX - mouseDownX;
                if (Math.abs(mouseDeltaX) > 10) {
                    li.style.transform = `translateX(${mouseDeltaX}px)`;
                }
            }
        });

        li.addEventListener('mouseup', () => {
            if (isMouseDown) {
                li.style.transition = 'transform 0.2s ease-out';
                if (mouseDeltaX < -60) {
                    li.classList.add('swipe-left');
                    li.classList.remove('swipe-right');
                    li.style.transform = `translateX(-80px)`;
                } else if (mouseDeltaX > 60) {
                    li.classList.add('swipe-right');
                    li.classList.remove('swipe-left');
                    li.style.transform = `translateX(80px)`;
                } else {
                    li.classList.remove('swipe-left', 'swipe-right');
                    li.style.transform = `translateX(0)`;
                }
            }
            isMouseDown = false;
        });

        li.addEventListener('mouseleave', () => {
            if (isMouseDown) { // Se o mouse sair enquanto arrasta, resetar
                li.style.transition = 'transform 0.2s ease-out';
                li.classList.remove('swipe-left', 'swipe-right');
                li.style.transform = `translateX(0)`;
            }
            isMouseDown = false;
        });


        // Eventos dos botões de ação
        li.querySelector('.item-checkbox').addEventListener('change', async (e) => {
            const itemId = parseInt(e.target.dataset.id);
            const isCompleted = e.target.checked;
            await updateItem(itemId, { concluido: isCompleted });
        });

        li.querySelector('.edit-btn').addEventListener('click', (e) => {
            const itemId = parseInt(e.currentTarget.dataset.id);
            const itemToEdit = shoppingList.find(i => i.id === itemId);
            if (itemToEdit) {
                editingItem = itemToEdit;
                elements.itemName.value = itemToEdit.nome;
                elements.itemQuantity.value = itemToEdit.quantidade;
                elements.itemPrice.value = itemToEdit.preco;
                selectedCategory = itemToEdit.categoria || 'geral'; // Define a categoria selecionada
                updateCategoryButtonText(selectedCategory);
                elements.addItemBtn.textContent = 'Salvar Edição';
                elements.addItemBtn.classList.add('btn-warning');
                showNotification('Editando item...', 'info');
            }
        });

        li.querySelector('.delete-btn').addEventListener('click', (e) => {
            const itemId = parseInt(e.currentTarget.dataset.id);
            deleteItem(itemId);
        });
    });

    updateSummary();
}

function updateSummary() {
    const totalItemsCount = shoppingList.length;
    const completedItemsCount = shoppingList.filter(item => item.concluido).length;
    const pendingItemsCount = totalItemsCount - completedItemsCount;

    const totalCost = shoppingList.reduce((sum, item) => sum + (item.quantidade * item.preco), 0);
    const completedCost = shoppingList.filter(item => item.concluido)
        .reduce((sum, item) => sum + (item.quantidade * item.preco), 0);

    elements.totalItems.textContent = totalItemsCount;
    elements.totalPrice.textContent = formatCurrency(totalCost);
    elements.summaryItems.textContent = `${totalItemsCount} (${pendingItemsCount} pendentes)`;
    elements.summaryCompleted.textContent = completedItemsCount;
    elements.summaryTotal.textContent = formatCurrency(totalCost); // Ou completedCost se preferir o total dos comprados
}

function updateCategoryButtonText(category) {
    const btn = document.getElementById('openCategoryModalBtn');
    if (btn) {
        const categoryName = category.charAt(0).toUpperCase() + category.slice(1);
        btn.innerHTML = `<i class="fas fa-tag"></i> Categoria: ${categoryName}`;
    }
}

// Mapeamento de palavras-chave para categorias automáticas
const categoriaPorPalavra = [
    { palavras: ["maçã", "banana", "laranja", "pera", "uva", "abacaxi", "fruta", "melancia", "mamão", "limão", "morango"], categoria: "hortifruti" },
    { palavras: ["alface", "tomate", "cenoura", "batata", "cebola", "alho", "verdura", "legume", "pepino", "abobrinha", "chuchu"], categoria: "hortifruti" },
    { palavras: ["arroz", "feijão", "macarrão", "massa", "farinha", "açúcar", "sal", "óleo", "trigo", "milho"], categoria: "alimentos" },
    { palavras: ["leite", "queijo", "manteiga", "requeijão", "iogurte", "laticínio", "creme de leite", "nata"], categoria: "laticinios" },
    { palavras: ["pão", "broa", "bolo", "croissant", "padaria", "rosca"], categoria: "padaria" },
    { palavras: ["carne", "frango", "bife", "peixe", "porco", "linguiça", "salsicha", "presunto", "mortadela", "bacon"], categoria: "carnes" },
    { palavras: ["cerveja", "refrigerante", "suco", "vinho", "água", "bebida", "whisky", "vodka", "cachaça"], categoria: "bebidas" },
    { palavras: ["sabão", "detergente", "desinfetante", "limpeza", "amaciante", "esponja", "cloro", "alvejante", "multiuso"], categoria: "limpeza" },
    { palavras: ["shampoo", "sabonete", "pasta de dente", "escova", "fio dental", "higiene", "absorvente", "desodorante", "papel higiênico"], categoria: "higiene" },
    { palavras: ["pizza", "lasanha", "sorvete", "congelado", "hamburguer", "nuggets"], categoria: "congelados" },
    { palavras: ["vassoura", "balde", "pano", "rodo", "casa", "lampada", "pregos", "parafuso", "ferramenta"], categoria: "casa" },
];

function detectarCategoriaAutomatica(nomeItem) {
    const nome = nomeItem.toLowerCase().trim();
    
    for (const grupo of categoriaPorPalavra) {
        for (const palavra of grupo.palavras) {
            // Usar regex para match mais preciso
            const regex = new RegExp(`\\b${palavra}\\b`, 'i');
            if (regex.test(nome)) {
                return grupo.categoria;
            }
        }
    }
    return "geral";
}

// Busca categoria aprendida no backend
async function buscarCategoriaAprendida(nomeItem) {
    try {
        const response = await fetch(`/api/categoria-aprendida/${encodeURIComponent(nomeItem.toLowerCase().trim())}`);
        if (response.ok) {
            const data = await response.json();
            if (data.success && data.categoria) {
                return data.categoria;
            }
        }
    } catch (e) {
        // Silencia erro
    }
    return null;
}

// Nova função: detectar categoria com aprendizado
async function detectarCategoriaComAprendizado(nomeItem) {
    const aprendida = await buscarCategoriaAprendida(nomeItem);
    if (aprendida) return aprendida;
    return detectarCategoriaAutomatica(nomeItem); // Usa a função existente para detecção automática
}

// Atualiza categoria automaticamente ao digitar o nome do item
if (elements.itemName) {
    elements.itemName.addEventListener('input', async function () {
        if (categoriaSelecionadaManualmente) return; // Não sobrescreve escolha manual
        const nome = elements.itemName.value;
        const categoriaDetectada = await detectarCategoriaComAprendizado(nome);
        selectedCategory = categoriaDetectada;
        if (elements.categoryFilter) {
            elements.categoryFilter.value = categoriaDetectada;
        }
        updateCategoryButtonText(selectedCategory);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Inicializa carregando as listas do usuário e mostrando a tela de seleção
    await fetchLists();
    showListSelectionScreen(); // Inicia o app na tela de seleção de listas

    // Eventos da Tela de Seleção de Listas
    elements.openCreateListModalBtn.addEventListener('click', () => {
        elements.createListModal.classList.add('active');
        elements.modalOverlay.classList.add('active');
    });

    elements.closeCreateListModalBtn.addEventListener('click', () => {
        elements.createListModal.classList.remove('active');
        elements.modalOverlay.classList.remove('active');
        elements.newListName.value = ''; // Limpa o campo
    });

    elements.createListForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const listName = elements.newListName.value.trim();
        if (listName) {
            await createList(listName);
            elements.createListModal.classList.remove('active');
            elements.modalOverlay.classList.remove('active');
            elements.newListName.value = ''; // Limpa o campo
        } else {
            showNotification('Por favor, digite um nome para a lista.', 'warning');
        }
    });

    // Botão de voltar para a tela de seleção de listas (na mainScreen)
    if (elements.backToListsBtn) {
        elements.backToListsBtn.addEventListener('click', () => {
            showListSelectionScreen();
        });
    }

    // Eventos da Tela Principal da Lista de Compras
    elements.form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = elements.itemName.value.trim();
        const quantity = parseInt(elements.itemQuantity.value);
        const price = parseFloat(elements.itemPrice.value) || 0;

        if (!name || quantity <= 0) {
            showNotification('Por favor, preencha o nome e uma quantidade válida.', 'warning');
            return;
        }

        let categoriaParaSalvar = selectedCategory;
        if (!categoriaSelecionadaManualmente) {
            categoriaParaSalvar = await detectarCategoriaComAprendizado(name);
            selectedCategory = categoriaParaSalvar;
        }

        if (editingItem) {
            await updateItem(editingItem.id, {
                nome: name,
                quantidade: quantity,
                preco: price,
                categoria: categoriaParaSalvar
            });
            editingItem = null;
            elements.addItemBtn.textContent = 'Adicionar';
            elements.addItemBtn.classList.remove('btn-warning');
        } else {
            await addItem({
                nome: name,
                quantidade: quantity,
                preco: price,
                categoria: categoriaParaSalvar,
                concluido: false,
                lista_id: currentListId
            });
        }

        elements.itemName.value = '';
        elements.itemQuantity.value = '1';
        elements.itemPrice.value = '';
        selectedCategory = 'geral';
        updateCategoryButtonText(selectedCategory);
        elements.itemName.focus();
        categoriaSelecionadaManualmente = false;
    });

    // Filtros
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.filter;
            renderShoppingList();
        });
    });

    // Limpar concluídos
    elements.clearCompleted.addEventListener('click', clearCompletedItems);

    // Limpar tudo
    elements.clearAll.addEventListener('click', clearAllItems);
    // Modais (Categoria)
    if (elements.openCategoryModalBtn) {
        elements.openCategoryModalBtn.addEventListener('click', () => {
            elements.categoryModal.classList.add('active');
            elements.modalOverlay.classList.add('active');
            // Marca a categoria atualmente selecionada no modal
            elements.categoryOptions.forEach(option => {
                option.classList.remove('selected');
                if (option.dataset.value === selectedCategory) {
                    option.classList.add('selected');
                }
            });
        });
    }

    elements.closeCategoryModal && elements.closeCategoryModal.addEventListener('click', () => {
        elements.categoryModal.classList.remove('active');
        elements.modalOverlay.classList.remove('active');
    });

    elements.categoryOptions.forEach(option => {
        option.addEventListener('click', (e) => {
            elements.categoryOptions.forEach(opt => opt.classList.remove('selected'));
            e.currentTarget.classList.add('selected');
            selectedCategory = e.currentTarget.dataset.value;
            categoriaSelecionadaManualmente = true;
            updateCategoryButtonText(selectedCategory);
            elements.categoryModal.classList.remove('active');
            elements.modalOverlay.classList.remove('active');
            showNotification(`Categoria definida para: ${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}`, 'info');
        });
    });

    // Fechar qualquer modal clicando no overlay
    elements.modalOverlay.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            elements.createListModal.classList.remove('active');
            elements.categoryModal.classList.remove('active');
            elements.modalOverlay.classList.remove('active');
            // Limpa o estado de edição se o modal de categoria for fechado durante a edição
            if (editingItem) {
                elements.itemName.value = editingItem.nome;
                elements.itemQuantity.value = editingItem.quantidade;
                elements.itemPrice.value = editingItem.preco;
                updateCategoryButtonText(editingItem.categoria || 'geral');
            }
        }
    });

    // Atualiza a lista ao mudar o filtro de categoria
    if (elements.categoryFilter) {
        elements.categoryFilter.addEventListener('change', () => {
            renderShoppingList();
        });
    }

    // Ajuste inicial do texto do botão de categoria
    updateCategoryButtonText(selectedCategory);

    // Adiciona o CSS para animação de pulse (melhor no CSS)
    const style = document.createElement('style');
    style.textContent = `
        @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
        }
    `;
    document.head.appendChild(style);
});