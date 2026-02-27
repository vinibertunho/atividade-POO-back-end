import PedidosModel from '../models/PedidosModels.js';

const STATUS_VALIDOS = ['ABERTO', 'PAGO', 'CANCELADO'];

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { clienteId, total, status } = req.body;

        if (!clienteId)
            return res.status(400).json({ error: 'O campo "clienteId" é obrigatório!' });
        if (total !== undefined)
            return res.status(400).json({ error: 'O campo "total" é calculado automaticamente.' });
        if (status !== undefined && status !== 'ABERTO') {
            return res.status(400).json({ error: 'Pedido deve iniciar obrigatoriamente com status ABERTO.' });
        }
        if (status && !STATUS_VALIDOS.includes(status)) {
            return res.status(400).json({ error: 'Status inválido. Use: ABERTO, PAGO ou CANCELADO.' });
        }

        const pedido = new PedidosModel({
            clienteId,
            status: 'ABERTO',
        });
        const data = await pedido.criar();

        res.status(201).json({ message: 'Pedido criado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao criar:', error);
        res.status(500).json({ error: 'Erro interno ao salvar o pedido.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const registros = await PedidosModel.buscarTodos(req.query);

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum pedido encontrado.' });
        }

        res.json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar pedidos.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await PedidosModel.buscarPorId(id);

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        res.json({ data: pedido });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        res.status(500).json({ error: 'Erro ao buscar pedido.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const { id } = req.params;

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const pedido = await PedidosModel.buscarPorId(id);

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado para atualizar.' });
        }

        if (req.body.total !== undefined) {
            return res.status(400).json({ error: 'O campo "total" é calculado automaticamente com base nos itens.' });
        }

        if (req.body.clienteId !== undefined) pedido.clienteId = req.body.clienteId;
        if (req.body.status !== undefined) {
            if (!STATUS_VALIDOS.includes(req.body.status)) {
                return res.status(400).json({ error: 'Status inválido. Use: ABERTO, PAGO ou CANCELADO.' });
            }

            if (req.body.status === 'CANCELADO' && pedido.status !== 'ABERTO') {
                return res.status(400).json({ error: 'Só é possível cancelar pedido com status ABERTO.' });
            }

            pedido.status = req.body.status;
        }

        const data = await pedido.atualizar();

        res.json({ message: 'Pedido atualizado com sucesso!', data });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        res.status(500).json({ error: 'Erro ao atualizar pedido.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const { id } = req.params;

        const pedido = await PedidosModel.buscarPorId(id);

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado para deletar.' });
        }

        await pedido.deletar();

        res.json({
            message: 'Pedido deletado com sucesso!',
            deletado: pedido,
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        res.status(500).json({ error: 'Erro ao deletar pedido.' });
    }
};
