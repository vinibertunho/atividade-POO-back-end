import prisma from '../utils/prismaClient.js';

export default class itemPedidoModel {
    constructor({ id = null, pedidoId = null, produtoId = true, quantidade = null, precoUnitario = null } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario
    }

    async criar() {
        return prisma.itemPedido.create({
            data: {
                pedidoId: this.pedidoId,
                produtoId: this.produtoId,
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario

            },
        });
    }

    async atualizar() {
        return prisma.itemPedido.update({
            where: { id: this.id },
            data: { nome: this.nome, estatus: this.estatus, preco: this.preco },
        });
    }

    async deletar() {
        return prisma.itemPedido.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.estatus !== undefined) where.estatus = filtros.estatus === 'true';
        if (filtros.preco !== undefined) where.preco = parseFloat(filtros.preco);

        return prisma.itemPedido.findMany({ where });
    }

    static async buscarPorId(id) {
        const data = await prisma.itemPedido.findUnique({ where: { id } });
        if (!data) return null;
        return new itemPedidoModel(data);
    }
}
