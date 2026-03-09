import itemPedidoModel from '../models/itemPedidosModel.js';

export const criar = async (req, res) => {
    try {
        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { pedidoId, produtoId, quantidade } = req.body;

        if (!pedidoId) return res.status(400).json({ error: 'O campo "pedidoId" é obrigatório!' });

        if (!produtoId)
            return res.status(400).json({ error: 'O campo "produtoId" é obrigatório!' });

        if (quantidade === undefined)
            return res.status(400).json({ error: 'O campo "quantidade" é obrigatório!' });

        const pedidoIdNumero = Number(pedidoId);
        const produtoIdNumero = Number(produtoId);
        const quantidadeNumero = Number(quantidade);

        if (Number.isNaN(pedidoIdNumero) || Number.isNaN(produtoIdNumero)) {
            return res.status(400).json({ error: 'ID inválido. Informe um número válido.' });
        }

        if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0 || quantidadeNumero > 99) {
            return res.status(400).json({ error: 'Quantidade deve ser entre 1 e 99.' });
        }

        const pedido = await itemPedidoModel.buscarPedidoPorId(pedidoIdNumero);
        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        if (pedido.status !== 'ABERTO') {
            return res.status(400).json({
                error: 'Não pode adicionar itens se o pedido estiver PAGO ou CANCELADO.',
            });
        }

        const produto = await itemPedidoModel.buscarProdutoPorId(produtoIdNumero);
        if (!produto) {
            return res.status(404).json({ error: 'Produto não encontrado.' });
        }

        if (!produto.disponivel) {
            return res.status(400).json({
                error: 'Não pode adicionar produto com disponivel = false ao pedido.',
            });
        }

        const itemPedido = new itemPedidoModel({
            pedidoId: pedidoIdNumero,
            produtoId: produtoIdNumero,
            quantidade: quantidadeNumero,
            precoUnitario: produto.preco,
        });

        const registro = await itemPedido.criar();
        await itemPedidoModel.recalcularTotalDoPedido(pedidoIdNumero);

        return res.status(201).json(registro);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ erro: 'Erro interno no servidor.' });
    }
};

export const buscarTodos = async (req, res) => {
    try {
        const { pedidoId, produtoId, quantidade } = req.query;

        const registros = await itemPedidoModel.buscarTodos({
            pedidoId,
            produtoId,
            quantidade,
        });

        if (!registros || registros.length === 0) {
            return res.status(200).json({ message: 'Nenhum registro encontrado.' });
        }

        return res.status(200).json(registros);
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ error: 'Erro ao buscar registros.' });
    }
};

export const buscarPorId = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'O ID enviado não é um número válido.' });
        }

        const itemPedido = await itemPedidoModel.buscarPorId(id);

        if (!itemPedido) {
            return res.status(404).json({ error: 'Registro não encontrado.' });
        }

        return res.status(200).json({ data: itemPedido });
    } catch (error) {
        console.error('Erro ao buscar:', error);
        return res.status(500).json({ error: 'Erro ao buscar registro.' });
    }
};

export const atualizar = async (req, res) => {
    try {
        const id = Number(req.params.id);

        if (Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        if (!req.body) {
            return res.status(400).json({ error: 'Corpo da requisição vazio. Envie os dados!' });
        }

        const { quantidade, produtoId } = req.body;

        const itemPedido = await itemPedidoModel.buscarPorId(id);

        if (!itemPedido) {
            return res.status(404).json({ error: 'Registro não encontrado para atualizar.' });
        }

        const pedido = await itemPedidoModel.buscarPedidoPorId(itemPedido.pedidoId);

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        if (pedido.status !== 'ABERTO') {
            return res.status(400).json({
                error: 'Não pode adicionar itens se o pedido estiver PAGO ou CANCELADO.',
            });
        }

        const dadosAtualizacao = {};

        if (quantidade !== undefined) {
            const quantidadeNumero = Number(quantidade);

            if (!Number.isInteger(quantidadeNumero) || quantidadeNumero <= 0) {
                return res.status(400).json({ error: 'Quantidade deve ser maior que 0.' });
            }

            dadosAtualizacao.quantidade = quantidadeNumero;
        }

        if (produtoId !== undefined) {
            const produtoIdNumero = Number(produtoId);

            if (Number.isNaN(produtoIdNumero)) {
                return res.status(400).json({ error: 'ID inválido. Informe um número válido.' });
            }

            const produto = await itemPedidoModel.buscarProdutoPorId(produtoIdNumero);

            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado.' });
            }

            if (!produto.disponivel) {
                return res.status(400).json({
                    error: 'Não pode adicionar produto com disponivel = false ao pedido.',
                });
            }

            dadosAtualizacao.produtoId = produtoIdNumero;
            dadosAtualizacao.precoUnitario = produto.preco;
        }

        if (Object.keys(dadosAtualizacao).length === 0) {
            return res.status(400).json({ error: 'Nenhum campo enviado para atualização.' });
        }

        const data = await itemPedido.atualizar(dadosAtualizacao);

        await itemPedidoModel.recalcularTotalDoPedido(itemPedido.pedidoId);

        return res.status(200).json({
            message: `O registro "${data.id}" foi atualizado com sucesso!`,
            data,
        });
    } catch (error) {
        console.error('Erro ao atualizar:', error);
        return res.status(500).json({ error: 'Erro ao atualizar registro.' });
    }
};

export const deletar = async (req, res) => {
    try {
        const pedidoIdDaRota = Number(req.params.id);
        const id = Number(req.params.itemId ?? req.params.id);

        if (Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        if (!Number.isNaN(pedidoIdDaRota) && pedidoIdDaRota <= 0)
            return res.status(400).json({ error: 'ID inválido.' });

        const itemPedido = await itemPedidoModel.buscarPorId(id);

        if (!itemPedido) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        const pedido = await itemPedidoModel.buscarPedidoPorId(itemPedido.pedidoId);

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido não encontrado.' });
        }

        if (!Number.isNaN(pedidoIdDaRota) && pedidoIdDaRota !== itemPedido.pedidoId) {
            return res.status(404).json({ error: 'Registro não encontrado para deletar.' });
        }

        if (pedido.status !== 'ABERTO') {
            return res.status(400).json({
                error: 'Não pode remover item de pedido PAGO ou CANCELADO.',
            });
        }

        await itemPedido.deletar();

        await itemPedidoModel.recalcularTotalDoPedido(itemPedido.pedidoId);

        return res.status(200).json({
            message: `O registro "${itemPedido.id}" foi deletado com sucesso!`,
            deletado: itemPedido,
        });
    } catch (error) {
        console.error('Erro ao deletar:', error);
        return res.status(500).json({ error: 'Erro ao deletar registro.' });
    }
};
