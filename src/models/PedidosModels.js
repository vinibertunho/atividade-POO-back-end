import prisma from '../utils/prismaClient.js';

export default class PedidosModel {
    constructor({
        id = null,
        clientId = null,
        total = null,
        status = 'ABERTO',
        criadoEm = null,
    } = {}) {
        this.id = id;
        this.clientId = clienteId;
        this.total = total;
        this.status = status;
        this.criadoEm = criadoEm;
    }

    async criar() {
        return prisma.pedidos.create({
            data: {
                clienteId: this.clientId,
                total: 0,
                status: 'ABERTO',
            },
        });
    }

    async atualizar() {
        const data = {};

        if (this.clientId !== null && this.clientId !== undefined) data.clientId = this.clientId;
        if (this.status !== null && this.status !== undefined) data.status = this.status;

        return prisma.pedido.update({
            where: { id: this.id },
            data,
        });
    }

    async deletar() {
        return prisma.pedido.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.total) where.total = { contains: filtros.total, mode: 'insensitive' };
        if (filtros.usuario) where.usuario = { contains: filtros.usuario, mode: 'insensitive' };
        if (filtros.status) where.status = { contains: filtros.status, mode: 'insensitive' };
       

        return prisma.usuario.findMany({ where, orderBy: { id: 'asc' } });
    }

    static async buscarPorId(id) {
        const data = await prisma.pedido.findUnique({ where: { id } });
        if (!data) return null;
        return new PedidosModel(data);
    }

    static async recalcularTotal(pedidoId) {
        const itens = await prisma.itemPedido.findMany({
            where: { pedidoId },
            select: { quantidade: true, precoUnit: true },
        });

        const totalCalculado = itens.reduce((acumulado, item) => {
            return acumulado + Number(item.precoUnit) * item.quantidade;
        }, 0);

        return prisma.pedido.update({
            where: { id: pedidoId },
            data: { total: totalCalculado },
        });
    }
}
