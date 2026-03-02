import prisma from '../utils/prismaClient.js';

export default class UsuarioModel {
    constructor({
        id = null,
        nome,
        telefone,
        email,
        cpf,
        cep,
        ativo = true,
    } = {}) {
        this.id = id;
        this.nome = nome;
        this.telefone = telefone;
        this.email = email;
        this.cpf = cpf;
        this.cep = cep;
        this.ativo = ativo;
    }

    async preencherEnderecoPorCep() {
        if (!this.cep) return;

        const cepLimpo = this.cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;

        try {
            const resposta = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const dados = await resposta.json();

            if (!dados.erro) {
                this.logradouro = dados.logradouro;
                this.bairro = dados.bairro;
                this.localidade = dados.localidade;
                this.uf = dados.uf;
            }
        } catch (error) {
            console.error('Erro ao buscar CEP no Model:', error.message);
        }
    }

    async criar() {
        await this.preencherEnderecoPorCep();

        return prisma.usuario.create({
            data: {
                nome: this.nome,
                telefone: this.telefone,
                email: this.email,
                cpf: this.cpf,
                cep: this.cep,
                logradouro: this.logradouro,
                bairro: this.bairro,
                localidade: this.localidade,
                uf: this.uf,
            },
        });
    }

    async atualizar() {
        await this.preencherEnderecoPorCep();

        return prisma.usuario.update({
            where: { id: this.id },
            data: {
                nome: this.nome,
                telefone: this.telefone,
                email: this.email,
                cpf: this.cpf,
                cep: this.cep,
                logradouro: this.logradouro,
                bairro: this.bairro,
                localidade: this.localidade,
                uf: this.uf,
            },
        });
    }

    async deletar() {
        return prisma.usuario.delete({ where: { id: this.id } });
    }

    static async buscarTodos(filtros = {}) {
        const where = {};



        if (filtros.nome) where.nome = { contains: filtros.nome, mode: 'insensitive' };
        if (filtros.telefone) where.telefone = { contains: filtros.telefone, mode: 'insensitive' };
        if (filtros.email) where.email = { contains: filtros.email, mode: 'insensitive' };
        if (filtros.cpf) where.cpf = { contains: filtros.cpf, mode: 'insensitive' };
        if (filtros.cep) where.cep = { contains: filtros.cep, mode: 'insensitive' };


        return prisma.usuario.findMany({ where, orderBy: { id: 'asc' } });
    }

    static async buscarPorId(id) {
        const data = await prisma.usuario.findUnique({ where: { id } });
        if (!data) return null;
        return new UsuarioModel(data);
    }
}
