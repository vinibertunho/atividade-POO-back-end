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

        await itemPedidoModel.recalcularTotalDoPedido(this.pedidoId);

        return registro;
    }

    async atualizar(dados) {
        if (!this.id) throw new Error('ID não definido.');

        const registro = await prisma.itemPedido.update({
            where: { id: this.id },
            data: dados,
        });

        await itemPedidoModel.recalcularTotalDoPedido(this.pedidoId);

        return registro;
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

        await prisma.itemPedido.delete({
            where: { id: this.id },
        });

        await itemPedidoModel.recalcularTotalDoPedido(item.pedidoId);

        return true;
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.pedidoId !== undefined) where.pedidoId = Number(filtros.pedidoId);
        if (filtros.produtoId !== undefined) where.produtoId = Number(filtros.produtoId);
        if (filtros.quantidade !== undefined) where.quantidade = Number(filtros.quantidade);

        return prisma.itemPedido.findMany({
            where,
            orderBy: { id: 'asc' },
        });
    }

    static async buscarPorId(id) {
        if (!id) throw new Error('ID não definido');

        const registro = await prisma.itemPedido.findUnique({
            where: { id },
        });

        if (!registro) return null;

        return new itemPedidoModel(registro);
    }

    static async buscarPedidoPorId(id) {
        return prisma.pedido.findUnique({ where: { id } });
    }

    static async buscarProdutoPorId(id) {
        return prisma.produto.findUnique({ where: { id } });
    }

    static async recalcularTotalDoPedido(pedidoId) {
        const itens = await prisma.itemPedido.findMany({
            where: { pedidoId },
            select: { quantidade: true, precoUnitario: true },
        });

        const total = itens.reduce((acumulador, item) => {
            return acumulador + Number(item.precoUnitario) * item.quantidade;
        }, 0);

        return prisma.pedido.update({
            where: { id: pedidoId },
            data: { total },
        });
    }
}
