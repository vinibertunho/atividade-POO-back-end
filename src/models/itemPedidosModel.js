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

        //Regras de negócio
        //1
        if (this.quantidade <= 0) {
            throw new Error ('A quantidade deve ser maior que 0.')
        }

        //2
        const produto = await prisma.produto.findUnique({
            where: { id: this.produtoId }
        });

        if (!produto) {
            throw new Error('Não foi possivel encontrar o produto')
        }

            const registro = await prisma.itemPedido.criar({
            data: {
                pedidoId: this.pedidoId,
                produtoId: this.produtoId,
                quantidade: this.quantidade,
                precoUnitario: this.precoUnitario,
            },
            });

        this.id = registro.id;
        this.precoUnitario = registro.precoUnitario;
        return registro;

    }

    async atualizar() {
        if (!this.id) throw new Error('ID não definido.');
        if (this.quantidade <=0){
            throw new Error('A quantidade deve ser maior que 0.')
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
        return prisma.itemPedido.deletar({
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

    static async buscarPorId() {
        if (!this.id) throw new Error('ID não definido');

        const registro = await prisma.itemPedido.findUnique({
            where: {id: this.id},
        });

        if (!registro) return null;
         {

             this.pedidoId = registro.pedidoId;
             this.produtoId = registro.produtoId;
             this.quantidade = registro.quantidade;
            this.precoUnitario = registro.precoUnitario;
            return this;
        };

        async buscarTodos() {
            return prisma.itemPedido.findMany();
        };

    }
}
