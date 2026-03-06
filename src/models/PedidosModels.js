import prisma from '../utils/prismaClient.js';

export const PedidoModel = {
    criar: async (clienteId) => {
        return prisma.pedido.create({
            data: {
                clienteId,
                status: 'ABERTO',
                total: 0,
            },
        });
    },

    listar: async () => {
        return prisma.pedido.findMany({
            include: {
                cliente: true,
                itens: true,
            },
        });
    },

    buscarPorId: async (id) => {
        return prisma.pedido.findUnique({
            where: { id: Number(id) },
            include: {
                cliente: true,
                itens: true,
            },
        });
    },

    atualizarStatus: async (id, status) => {
        return prisma.pedido.update({
            where: { id: Number(id) },
            data: { status },
        });
    },

    atualizarTotal: async (id, total) => {
        return prisma.pedido.update({
            where: { id: Number(id) },
            data: { total },
        });
    },

    atualizar: async (id, data) => {
        return prisma.pedido.update({
            where: { id: Number(id) },
            data,
        });
    },

    deletar: async (id) => {
        const pedidoId = Number(id);

        return prisma.$transaction(async (tx) => {
            await tx.itemPedido.deleteMany({
                where: { pedidoId },
            });

            return tx.pedido.delete({
                where: { id: pedidoId },
            });
        });
    },
};
