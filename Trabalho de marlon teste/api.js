const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Dados dos produtos baseados nas imagens fornecidas
const produtos = [
  {
    id: 1,
    nome: "Café com Canela Cremoso",
    descricao:
      "Um delicioso café cremoso, aromatizado com canela e servido com um pau de canela para um toque especial.",
    preco: 18.0,
    categoria: "bebidas",
    imagem: "cafe-canela-cremoso.jpeg",
    estoque: 25,
  },
  {
    id: 2,
    nome: "Mocha Gelado",
    descricao:
      "Mocha gelado com café espresso, leite vaporizado, chantilly e calda de chocolate, servido com gelo.",
    preco: 16.5,
    categoria: "bebidas",
    imagem: "Mocha-Gelado.jpeg",
    estoque: 30,
  },
  {
    id: 3,
    nome: "Chocolate Quente Cremoso",
    descricao:
      "Delicioso chocolate quente cremoso, coberto com chantilly e raspas de chocolate.",
    preco: 18.5,
    categoria: "bebidas",
    imagem: "chocolate-quente-cremoso.jpeg",
    estoque: 20,
  },
  {
    id: 4,
    nome: "Esfihas fechadas",
    descricao:
      "Esfihas fechadas com massa folhada, recheio de carne moída, queijo e molho de tomate, servidas em 3 unidades.",
    preco: 8.5,
    categoria: "salgados",
    imagem: "Esfihas-fechadas.jpeg",
    estoque: 25,
  },
];

// Carrinho de compras (simulado em memória)
let carrinho = [];

// Rotas da API

// GET /api/produtos - Lista todos os produtos
app.get("/api/produtos", (req, res) => {
  const { categoria } = req.query;

  let produtosFiltrados = produtos;

  if (categoria && categoria !== "all") {
    produtosFiltrados = produtos.filter(
      (produto) => produto.categoria === categoria
    );
  }

  res.json({
    success: true,
    data: produtosFiltrados,
    total: produtosFiltrados.length,
  });
});

// GET /api/produtos/:id - Busca produto por ID
app.get("/api/produtos/:id", (req, res) => {
  const { id } = req.params;
  const produto = produtos.find((p) => p.id === parseInt(id));

  if (!produto) {
    return res.status(404).json({
      success: false,
      message: "Produto não encontrado",
    });
  }

  res.json({
    success: true,
    data: produto,
  });
});

// GET /api/categorias - Lista todas as categorias
app.get("/api/categorias", (req, res) => {
  const categorias = [...new Set(produtos.map((produto) => produto.categoria))];

  res.json({
    success: true,
    data: categorias,
  });
});

// POST /api/carrinho - Adiciona item ao carrinho
app.post("/api/carrinho", (req, res) => {
  const { produtoId, quantidade = 1 } = req.body;

  const produto = produtos.find((p) => p.id === parseInt(produtoId));

  if (!produto) {
    return res.status(404).json({
      success: false,
      message: "Produto não encontrado",
    });
  }

  if (produto.estoque < quantidade) {
    return res.status(400).json({
      success: false,
      message: "Estoque insuficiente",
    });
  }

  const itemExistente = carrinho.find(
    (item) => item.produtoId === parseInt(produtoId)
  );

  if (itemExistente) {
    itemExistente.quantidade += quantidade;
  } else {
    carrinho.push({
      produtoId: parseInt(produtoId),
      quantidade,
      produto: produto,
    });
  }

  res.json({
    success: true,
    message: "Item adicionado ao carrinho",
    data: carrinho,
  });
});

// GET /api/carrinho - Lista itens do carrinho
app.get("/api/carrinho", (req, res) => {
  const carrinhoComTotal = carrinho.map((item) => ({
    ...item,
    subtotal: item.produto.preco * item.quantidade,
  }));

  const total = carrinhoComTotal.reduce((acc, item) => acc + item.subtotal, 0);

  res.json({
    success: true,
    data: carrinhoComTotal,
    total: total,
  });
});

// DELETE /api/carrinho/:produtoId - Remove item do carrinho
app.delete("/api/carrinho/:produtoId", (req, res) => {
  const { produtoId } = req.params;

  carrinho = carrinho.filter((item) => item.produtoId !== parseInt(produtoId));

  res.json({
    success: true,
    message: "Item removido do carrinho",
    data: carrinho,
  });
});

// PUT /api/carrinho/:produtoId - Atualiza quantidade do item
app.put("/api/carrinho/:produtoId", (req, res) => {
  const { produtoId } = req.params;
  const { quantidade } = req.body;

  const item = carrinho.find((item) => item.produtoId === parseInt(produtoId));

  if (!item) {
    return res.status(404).json({
      success: false,
      message: "Item não encontrado no carrinho",
    });
  }

  if (quantidade <= 0) {
    carrinho = carrinho.filter(
      (item) => item.produtoId !== parseInt(produtoId)
    );
  } else {
    item.quantidade = quantidade;
  }

  res.json({
    success: true,
    message: "Carrinho atualizado",
    data: carrinho,
  });
});

// POST /api/checkout - Finaliza compra
app.post("/api/checkout", (req, res) => {
  const { dadosCliente } = req.body;

  if (carrinho.length === 0) {
    return res.status(400).json({
      success: false,
      message: "Carrinho vazio",
    });
  }

  // Simula processamento do pedido
  const pedido = {
    id: Date.now(),
    data: new Date().toISOString(),
    itens: carrinho,
    total: carrinho.reduce(
      (acc, item) => acc + item.produto.preco * item.quantidade,
      0
    ),
    status: "processando",
    dadosCliente: dadosCliente || {},
  };

  // Limpa o carrinho
  carrinho = [];

  res.json({
    success: true,
    message: "Pedido realizado com sucesso!",
    data: pedido,
  });
});

// Rota de teste
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API da Cafeteria funcionando!",
    timestamp: new Date().toISOString(),
  });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Erro interno do servidor",
  });
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📱 API disponível em: http://localhost:${PORT}/api`);
  console.log(`🧪 Teste: http://localhost:${PORT}/api/test`);
  console.log(`📋 Produtos: http://localhost:${PORT}/api/produtos`);
});
