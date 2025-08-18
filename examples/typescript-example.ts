// Exemplo: Como seria seu código atual em TypeScript

// Definindo interfaces para tipagem
interface ShoppingItem {
    id: number;
    nome: string;
    quantidade: number;
    preco: number;
    categoria: string;
    concluido: boolean;
    lista_id: number;
}

interface ShoppingList {
    id: number;
    nome: string;
    device_id: string;
}

interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
    error?: any;
}

// Classe para gerenciar a lista
class ListaDeComprasManager {
    private currentListId: number | null = null;
    private shoppingList: ShoppingItem[] = [];
    private userLists: ShoppingList[] = [];

    constructor(private baseUrl: string = '') {}

    // Método tipado para buscar listas
    async fetchListas(deviceId: string): Promise<ApiResponse<ShoppingList[]>> {
        try {
            const response = await fetch(`${this.baseUrl}/api/listas?deviceId=${deviceId}`);
            const data: ApiResponse<ShoppingList[]> = await response.json();
            return data;
        } catch (error) {
            return { success: false, message: 'Erro ao buscar listas', error };
        }
    }

    // Método tipado para adicionar item
    async addItem(item: Omit<ShoppingItem, 'id'>): Promise<ApiResponse<{ itemId: number }>> {
        try {
            const response = await fetch(`${this.baseUrl}/api/listas/${item.lista_id}/itens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(item)
            });
            return await response.json();
        } catch (error) {
            return { success: false, message: 'Erro ao adicionar item', error };
        }
    }

    // Getter tipado
    getCurrentList(): ShoppingList | null {
        return this.userLists.find(list => list.id === this.currentListId) || null;
    }
}

// Enum para categorias
enum Categoria {
    GERAL = 'geral',
    HORTIFRUTI = 'hortifruti',
    ALIMENTOS = 'alimentos',
    LATICINIOS = 'laticinios',
    PADARIA = 'padaria',
    CARNES = 'carnes',
    BEBIDAS = 'bebidas',
    LIMPEZA = 'limpeza',
    HIGIENE = 'higiene',
    CONGELADOS = 'congelados',
    CASA = 'casa'
}

// Uso das tipagens
const manager = new ListaDeComprasManager('/api');

// TypeScript vai detectar erros como:
// manager.addItem({ nome: 123 }); // ERRO: nome deve ser string
// manager.getCurrentList().invalidProperty; // ERRO: propriedade não existe
