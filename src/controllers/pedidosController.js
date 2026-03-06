import prisma from '../utils/prismaClient.js';
import { PedidoModel } from '../models/PedidosModels.js';

export const criarPedido = async (req, res) => {
    try {
        const { clienteId } = req.body;
        const clienteIdNum = Number(clienteId);

        if (!Number.isInteger(clienteIdNum) || clienteIdNum <= 0) {
            return res.status(400).json({ erro: 'clienteId inválido' });
        }

        const cliente = await prisma.usuario.findUnique({
            where: { id: clienteIdNum },
        });

        if (!cliente) {
            return res.status(404).json({
                erro: 'Cliente não encontrado',
            });
        }

        // regra: cliente precisa estar ativo
        if (cliente.ativo === false) {
            return res.status(400).json({
                erro: 'Não é possível criar pedido para cliente inativo',
            });
        }

        const pedido = await PedidoModel.criar(clienteIdNum);

        res.status(201).json(pedido);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

export const listarPedidos = async (req, res) => {
    try {
        const pedidos = await PedidoModel.listar();

        res.json(pedidos);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

export const buscarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedidoId = Number(id);

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({ erro: 'ID do pedido inválido' });
        }

        const pedido = await PedidoModel.buscarPorId(pedidoId);

        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        res.json(pedido);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

export const adicionarItem = async (req, res) => {
    try {
        const { pedidoId, produtoId, quantidade, preco } = req.body;
        const pedidoIdNum = Number(pedidoId);

        if (!Number.isInteger(pedidoIdNum) || pedidoIdNum <= 0) {
            return res.status(400).json({ erro: 'pedidoId inválido' });
        }

        const pedido = await PedidoModel.buscarPorId(pedidoIdNum);

        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        // regra: não adicionar itens se pago ou cancelado
        if (pedido.status === 'PAGO' || pedido.status === 'CANCELADO') {
            return res.status(400).json({
                erro: 'Não é possível adicionar itens a um pedido finalizado',
            });
        }

        const item = await prisma.itemPedido.create({
            data: {
                pedidoId: pedidoIdNum,
                produtoId,
                quantidade,
                preco,
            },
        });

        // recalcular total automaticamente
        const itens = await prisma.itemPedido.findMany({
            where: { pedidoId: pedidoIdNum },
        });

        const total = itens.reduce((soma, item) => {
            return soma + item.preco * item.quantidade;
        }, 0);

        await PedidoModel.atualizarTotal(pedidoIdNum, total);

        res.json(item);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

export const cancelarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedidoId = Number(id);

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({ erro: 'ID do pedido inválido' });
        }

        const pedido = await PedidoModel.buscarPorId(pedidoId);

        if (!pedido) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        // regra: só cancelar se estiver aberto
        if (pedido.status !== 'ABERTO') {
            return res.status(400).json({
                erro: 'Só é possível cancelar pedidos ABERTOS',
            });
        }

        const cancelado = await PedidoModel.atualizarStatus(pedidoId, 'CANCELADO');

        res.json(cancelado);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

export const atualizarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedidoId = Number(id);

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({ erro: 'ID do pedido inválido' });
        }

        const pedidoExistente = await PedidoModel.buscarPorId(pedidoId);

        if (!pedidoExistente) {
            return res.status(404).json({ erro: 'Pedido não encontrado' });
        }

        const { clienteId, total, status } = req.body;
        const data = {};

        if (clienteId !== undefined) {
            const clienteIdNum = Number(clienteId);

            if (!Number.isInteger(clienteIdNum) || clienteIdNum <= 0) {
                return res.status(400).json({ erro: 'clienteId inválido' });
            }

            const cliente = await prisma.usuario.findUnique({
                where: { id: clienteIdNum },
            });

            if (!cliente) {
                return res.status(404).json({ erro: 'Cliente não encontrado' });
            }

            if (cliente.ativo === false) {
                return res
                    .status(400)
                    .json({ erro: 'Não é possível vincular pedido a cliente inativo' });
            }

            data.clienteId = clienteIdNum;
        }

        if (total !== undefined) {
            const totalNum = Number(total);

            if (Number.isNaN(totalNum) || totalNum < 0) {
                return res.status(400).json({ erro: 'total inválido' });
            }

            data.total = totalNum;
        }

        if (status !== undefined) {
            const statusValido = ['ABERTO', 'PAGO', 'CANCELADO'];

            if (!statusValido.includes(status)) {
                return res.status(400).json({ erro: 'status inválido' });
            }

            data.status = status;
        }

        if (Object.keys(data).length === 0) {
            return res.status(400).json({ erro: 'Informe ao menos um campo para atualizar' });
        }

        const pedidoAtualizado = await PedidoModel.atualizar(pedidoId, data);

        res.json(pedidoAtualizado);
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};

export const deletarPedido = async (req, res) => {
    try {
        const { id } = req.params;
        const pedidoId = Number(id);

        if (!Number.isInteger(pedidoId) || pedidoId <= 0) {
            return res.status(400).json({ erro: 'ID do pedido inválido' });
        }

        await PedidoModel.deletar(pedidoId);

        res.json({ mensagem: 'Pedido deletado' });
    } catch (error) {
        res.status(500).json({ erro: error.message });
    }
};
