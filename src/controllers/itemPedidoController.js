import itemPedidoModel from '../models/itemPedidoModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { pedidoId, produtoId, quantidade } = req.body;

        if (!pedidoId) return res.status(400).json({ error: 'O campo "pedidoId" é obrigatório!' });

        const itemPedido = new itemPedidoModel({
            pedidoId,
            produtoId,
            quantidade,
        });
        const data = await itemPedido.criar();

        res.status(201).json({ message: 'Registro criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o registro.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await itemPedidoModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum registro encontrado.' });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const itemPedido = await itemPedidoModel.buscarPorId(parseInt(id));

        if (!itemPedido) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        res.json({ data: itemPedido });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const itemPedido = await itemPedidoModel.buscarPorId(parseInt(id));

        if (!itemPedido) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        if (req.body.pedidoId !== undefined) itemPedido.pedidoId = req.body.pedidoId;
        if (req.body.produtoId !== undefined) itemPedido.produtoId = req.body.produtoId;
        if (req.body.quantidade !== undefined) itemPedido.quantidade = req.body.quantidade;

        const data = await itemPedido.atualizar();

        res.json({ message: `O registro "${data.id}" foi atualizado com sucesso!`, data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        if (isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const itemPedido = await itemPedidoModel.buscarPorId(parseInt(id));

        if (!itemPedido) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        await itemPedido.deletar();

        res.json({
            message: `O registro "${itemPedido.id}" foi deletado com sucesso!`,
            deletado: itemPedido,
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
