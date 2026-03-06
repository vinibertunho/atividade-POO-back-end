import prisma from '../utils/prismaClient.js';

export default class itemPedidoModel {
    constructor({
        id = null,
        pedidoId = null,
        produtoId = null,
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
        // Regra de Negócio 1
        if (this.quantidade <= 0 || this.quantidade > 99) {
            throw new Error('A quantidade deve ser entre 1 e 99.');
        }

        const produto = await prisma.produto.findUnique({
            where: { id: this.produtoId },
        });

        // Regra de Negócio 3
        if (!produto) {
            throw new Error('Não foi possivel encontrar o produto');
        }

        if (!produto.disponivel) throw new Error('Produto indisponível no momento.');

        const registro = await prisma.itemPedido.create({
            data: {
                pedidoId: this.pedidoId,
                produtoId: this.produtoId,
                quantidade: this.quantidade,

                // Regra de Negócio 2
                precoUnitario: produto.preco,
            },
        });

        this.id = registro.id;
        this.precoUnitario = registro.precoUnitario;
        return registro;
    }

    async atualizar() {
        if (!this.id) throw new Error('ID não definido.');
        if (this.quantidade <= 0) {
            throw new Error('A quantidade deve ser maior que 0.');
        }

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
        if (!this.id) throw new Error('ID não definido.');

        const item = await prisma.itemPedido.findUnique({
            where: { id: this.id },
            include: { pedido: true },
        });

        if (!item) throw new Error('Item não encontrado.');

        // Regra de Negócio 4
        if (['PAGO', 'CANCELADO'].includes(item.pedido.status)) {
            throw new Error('Não é possível remover item de pedido PAGO ou CANCELADO.');
        }

        return prisma.itemPedido.delete({
            where: { id: this.id },
        });
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
        if (!id) throw new Error('ID não definido');

        const registro = await prisma.itemPedido.findUnique({
            where: { id },
        });

        if (!registro) return null;

        this.pedidoId = registro.pedidoId;
        this.produtoId = registro.produtoId;
        this.quantidade = registro.quantidade;
        this.precoUnitario = registro.precoUnitario;
        return this;
    }
}
