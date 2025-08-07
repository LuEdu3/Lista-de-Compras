// Exemplo: Como seria seu projeto com React

// components/ShoppingList.jsx
import React, { useState, useEffect } from 'react';
import { ShoppingItem } from './ShoppingItem';
import { AddItemForm } from './AddItemForm';
import { ListSummary } from './ListSummary';

export const ShoppingList = ({ listId, deviceId }) => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchItems();
    }, [listId]);

    const fetchItems = async () => {
        try {
            const response = await fetch(`/api/listas/${listId}/itens`);
            const data = await response.json();
            if (data.success) {
                setItems(data.data);
            }
        } catch (error) {
            console.error('Erro ao buscar itens:', error);
        } finally {
            setLoading(false);
        }
    };

    const addItem = async (newItem) => {
        try {
            const response = await fetch(`/api/listas/${listId}/itens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newItem)
            });
            
            if (response.ok) {
                fetchItems(); // Recarrega a lista
            }
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
        }
    };

    const toggleItem = async (itemId, completed) => {
        try {
            await fetch(`/api/itens/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ concluido: completed })
            });
            fetchItems();
        } catch (error) {
            console.error('Erro ao atualizar item:', error);
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === 'completed') return item.concluido;
        if (filter === 'pending') return !item.concluido;
        return true;
    });

    if (loading) return <div>Carregando...</div>;

    return (
        <div className="shopping-list">
            <AddItemForm onAddItem={addItem} />
            
            <div className="filter-buttons">
                <button 
                    className={filter === 'all' ? 'active' : ''}
                    onClick={() => setFilter('all')}
                >
                    Todos
                </button>
                <button 
                    className={filter === 'pending' ? 'active' : ''}
                    onClick={() => setFilter('pending')}
                >
                    Pendentes
                </button>
                <button 
                    className={filter === 'completed' ? 'active' : ''}
                    onClick={() => setFilter('completed')}
                >
                    Concluídos
                </button>
            </div>

            <div className="items-container">
                {filteredItems.map(item => (
                    <ShoppingItem 
                        key={item.id}
                        item={item}
                        onToggle={toggleItem}
                        onEdit={fetchItems}
                        onDelete={fetchItems}
                    />
                ))}
            </div>

            <ListSummary items={items} />
        </div>
    );
};

// components/ShoppingItem.jsx
import React, { useState } from 'react';

export const ShoppingItem = ({ item, onToggle, onEdit, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        nome: item.nome,
        quantidade: item.quantidade,
        preco: item.preco
    });

    const handleToggle = () => {
        onToggle(item.id, !item.concluido);
    };

    const handleSave = async () => {
        try {
            await fetch(`/api/itens/${item.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editData)
            });
            setIsEditing(false);
            onEdit();
        } catch (error) {
            console.error('Erro ao editar item:', error);
        }
    };

    const handleDelete = async () => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            try {
                await fetch(`/api/itens/${item.id}`, { method: 'DELETE' });
                onDelete();
            } catch (error) {
                console.error('Erro ao excluir item:', error);
            }
        }
    };

    return (
        <div className={`shopping-item ${item.concluido ? 'completed' : ''}`}>
            <input 
                type="checkbox" 
                checked={item.concluido}
                onChange={handleToggle}
            />
            
            {isEditing ? (
                <div className="edit-form">
                    <input 
                        value={editData.nome}
                        onChange={(e) => setEditData({...editData, nome: e.target.value})}
                    />
                    <input 
                        type="number"
                        value={editData.quantidade}
                        onChange={(e) => setEditData({...editData, quantidade: +e.target.value})}
                    />
                    <input 
                        type="number"
                        step="0.01"
                        value={editData.preco}
                        onChange={(e) => setEditData({...editData, preco: +e.target.value})}
                    />
                    <button onClick={handleSave}>Salvar</button>
                    <button onClick={() => setIsEditing(false)}>Cancelar</button>
                </div>
            ) : (
                <div className="item-info">
                    <span className="name">{item.nome}</span>
                    <span className="quantity">Qtd: {item.quantidade}</span>
                    <span className="price">R$ {item.preco.toFixed(2)}</span>
                    <span className="category">{item.categoria}</span>
                    
                    <div className="actions">
                        <button onClick={() => setIsEditing(true)}>Editar</button>
                        <button onClick={handleDelete}>Excluir</button>
                    </div>
                </div>
            )}
        </div>
    );
};

// hooks/useApi.js - Custom Hook para API
import { useState, useCallback } from 'react';

export const useApi = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const request = useCallback(async (url, options = {}) => {
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                ...options
            });
            
            const data = await response.json();
            return data;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return { request, loading, error };
};

// Vantagens do React:
// 1. Componentes reutilizáveis
// 2. Estado gerenciado automaticamente
// 3. Código mais organizado e modular
// 4. Facilita testes unitários
// 5. Comunidade e ecosystem gigante
