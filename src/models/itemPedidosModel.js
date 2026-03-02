import prisma from '../utils/prismaClient.js';

export default class itemPedidoModel {
    constructor({ id, pedidoId, produtoId, quantidade, precoUnitario } = {}) {
        this.id = id;
        this.pedidoId = pedidoId;
        this.produtoId = produtoId;
        this.quantidade = quantidade;
        this.precoUnitario = precoUnitario;
    }

    async criar() {
        //Regras de negócio
        //1
        if (this.quantidade <= 0) {
            throw new Error('A quantidade deve ser maior que 0.');
        }

        //2
        const produto = await prisma.produto.findUnique({
            where: { id: this.produtoId },
        });

        if (!produto) {
            throw new Error('Não foi possivel encontrar o produto');
        }

        const registro = await prisma.itemPedido.criar({
            data: {
                pedidoId: this.pedidoId,
                produtoId: this.produtoId,
                quantidade: this.quantidade,
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
            },
        });
    }

    async deletar() {
        if (!this.id) throw new Error('ID não definido.');
        return prisma.itemPedido.deletar({
            where: { id: this.id },
        });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};

        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.estatus !== undefined) where.estatus = filtros.estatus === 'true';
        if (filtros.preco !== undefined) where.preco = parseFloat(filtros.preco);

        return prisma.itemPedido.findMany({ where });
    }

    static async buscarPorId() {
        if (!this.id) throw new Error('ID não definido');

        const registro = await prisma.itemPedido.findUnique({
            where: { id: this.id },
        });

        if (!registro) return null;
        {
            this.pedidoId = registro.pedidoId;
            this.produtoId = registro.produtoId;
            this.quantidade = registro.quantidade;
            this.precoUnitario = registro.precoUnitario;
            return this;
        }
    }
}
