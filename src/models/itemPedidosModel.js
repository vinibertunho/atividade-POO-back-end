import prisma from '../utils/prismaClient.js';

export default class itemPedidoModel {
    constructor({
        id = null,
        pedidoId = null,
        produtoId = null,
        quantidade = null,
        precoUnit = null,
    } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnit = precoUnit;
    }

    async criar() {
        if (this.quantidade <= 0) {
            throw new Error('A quantidade deve ser maior que 0.');
        }

        const produto = await prisma.produto.findUnique({
            where: { id: parseInt(this.produtoId) },
        });

        if (!produto) {
            throw new Error('Não foi possível encontrar o produto');
        }

        const registro = await prisma.itemPedido.create({
            data: {
                pedidoId: parseInt(this.pedidoId),
                produtoId: parseInt(this.produtoId),
                quantidade: parseInt(this.quantidade),
                precoUnit: produto.preco
            },
        });

        this.id = registro.id;
        this.precoUnit = registro.precoUnit;
        return registro;
    }

    async atualizar() {
        if (!this.id) throw new Error('ID não definido.');

        return await prisma.itemPedido.update({
            where: { id: parseInt(this.id) },
            data: {
                quantidade: parseInt(this.quantidade),
                pedidoId: parseInt(this.pedidoId),
                produtoId: parseInt(this.produtoId)
            },
        });
    }

    async deletar() {
        if (!this.id) throw new Error('ID não definido.');

        return await prisma.itemPedido.delete({
            where: { id: parseInt(this.id) },
        });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.pedidoId) where.pedidoId = parseInt(filtros.pedidoId);
        if (filtros.produtoId) where.produtoId = parseInt(filtros.produtoId);

        return await prisma.itemPedido.findMany({ 
            where,
            include: { 
                produto: true,
                pedido: true 
            } 
        });
    }

    static async buscarPorId(id) {
        return await prisma.itemPedido.findUnique({
            where: { id: parseInt(id) },
            include: { produto: true }
        });
    }
}