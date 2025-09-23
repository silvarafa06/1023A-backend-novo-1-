import usuarioController from "./usuarios/usuario.controller.js";
import carrinhoController from './carrinho/carrinho.controller.js'
import produtosController from './produtos/produtos.controller.js'

import { Router } from "express";

const rotas = Router();

//Criando rotas para os usuários
rotas.post("/usuarios", usuarioController.adicionar);
rotas.get("/usuarios", usuarioController.listar);

// Rotas do Carrinho
rotas.get('/carrinho', carrinhoController.listar)
rotas.post('/carrinho', carrinhoController.adicionar)
rotas.put('/carrinho/quantidade', carrinhoController.atualizarQuantidade)
rotas.delete('/carrinho/item', carrinhoController.removerItem)
rotas.delete('/carrinho', carrinhoController.remover)

// Rotas dos produtos
rotas.get('/produtos',produtosController.listar)
rotas.post('/produtos',produtosController.adicionar)

export default rotas;