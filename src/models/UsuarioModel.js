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
}
