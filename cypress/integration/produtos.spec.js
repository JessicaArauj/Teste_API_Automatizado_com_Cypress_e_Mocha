/// <reference types="cypress" />
import contrato from '../contracts/produtos.contract'

describe('Testes da Funcionalidade Produtos', () => {
    let token
    before(() => {
        cy.token('fulano@qa.com', 'teste').then(tkn => { token = tkn})
    });

    it('Deve validar contrato de produtos', () => {
        cy.request('produtos').then(response => {
            return contrato.validateAsync(response.body)
        })
    });

    it('Listar produtos', () => {
        cy.request({
            method: 'GET',
            url: 'produtos'
        }).then((response) => {
            //expect(response.body.produtos[3].nome).to.equal('Produto EBAC 96632')
            expect(response.status).to.equal(200)
            expect(response.body).to.have.property('produtos')
            expect(response.duration).to.be.lessThan(15)
        })
    });

    it('Cadastrar produto', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
        cy.request({ // uma forma de fazer a requisição
            method: 'POST',
            url: 'produtos',
            body: {
                "nome": produto,
                "preco": 70,
                "descricao": "Mouse",
                "quantidade": 3
              },
              headers: {authorization: token}
        }).then((response) => {
            expect(response.status).to.equal(201)
            expect(response.body.message).to.equal('Cadastro realizado com sucesso')
        })
    });
   
    it('Deve validar mensagem de erro ao cadastrar produto repetido', () => { // melhor forma utilizando boas práticas
       cy.cadastrarProduto(token, 'Iphone X', 70, 'descrição do produto', 300 )
        .then((response) => {
            expect(response.status).to.equal(400)
            expect(response.body.message).to.equal('Já existe produto com esse nome')
        })
    });

    it('Deve editar um produto já cadastrado', () => {
        cy.request('produtos').then(response => {
            let id = (response.body.produtos[0]._id)
            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: {authorization: token},
                body:{
                        "nome": "Logitech C",
                        "preco": 47,
                        "descricao": "Mouse",
                        "quantidade": 32,
                }

            }).then(response => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })
        })
    });

    it('Deve editar um produto cadastrado previamente', () => {
        let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
        cy.cadastrarProduto(token, produto, 70, 'descrição do produto', 300 )
        .then(response =>{
            let id = response.body._id

            cy.request({
                method: 'PUT',
                url: `produtos/${id}`,
                headers: {authorization: token},
                body:{
                        "nome": produto,
                        "preco": 467,
                        "descricao": "Mouse",
                        "quantidade": 3762,
                }

            }).then(response => {
                expect(response.body.message).to.equal('Registro alterado com sucesso')
            })

        })


        it('Deve deletar um produto previamente cadastrado', () => {
            let produto = `Produto EBAC ${Math.floor(Math.random() * 100000)}`
            cy.cadastrarProduto(token, produto, 70, 'descrição do produto', 300 )
            .then(response =>{
                let id = response.body.id_
                cy.request({
                    method: 'DELETE',
                    url: `produto/${id}`,
                    headers: {authorization: token}
                }).then(response =>{
                    expect(response.body.message).to.equal('Registro aexcluído com sucesso')
                    expect(response.status).to.equal(200)
                })
            })
        });
    });



    

})