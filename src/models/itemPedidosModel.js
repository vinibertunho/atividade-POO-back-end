import prisma from '../utils/prismaClient.js';

export default class itemPedidoModel {
    constructor({
        id = null,
        pedidoId = null,
        produtoId = null, // corrigido (antes estava true)
        quantidade = null,
        precoUnitario = null,
    } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    async criar() {
        return prisma.itemPedido.create({
            data: {
                pedidoId: this.pedidoId,
                produtoId: this.produtoId,
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario,
            },
        });
    }

    async atualizar() {
        return prisma.itemPedido.update({
            where: { id: this.id },
            data: {
                pedidoId: this.pedidoId,
                produtoId: this.produtoId,
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario,
            },
        });
    }

    async deletar() {
        return prisma.itemPedido.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.pedidoId !== undefined) where.pedidoId = parseInt(filtros.pedidoId);

        if (filtros.produtoId !== undefined) where.produtoId = parseInt(filtros.produtoId);

        if (filtros.quantidade !== undefined) where.quantidade = parseInt(filtros.quantidade);

        if (filtros.precoUnitario !== undefined)
            where.precoUnitario = parseFloat(filtros.precoUnitario);

        return prisma.itemPedido.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.itemPedido.findUnique({ where: { id } });
        if (!data) return null;
        return new itemPedidoModel(data);
    }
}
