# E-commerce Microservices

Plataforma de e-commerce baseada em microsserviços, construída com **NestJS**, **TypeScript**, e implantada na **AWS** utilizando **AWS CDK v2** para Infrastructure as Code.

Projeto desenvolvido com foco em aprendizado prático de arquitetura de microsserviços, mensageria assíncrona e serviços gerenciados da AWS.

---

## 🏗️ Arquitetura

```
[Cliente] → [API Gateway] → [ALB/NLB] → [ECS Fargate Services]
                                              ├── Products Service
                                              └── ...
                                              
[Services] → [SNS/SQS] → [Comunicação assíncrona entre serviços]
[Services] → [DynamoDB] → [Persistência de dados]
[Services] → [S3] → [Armazenamento de arquivos/imagens]
```

> *Novos serviços serão adicionados conforme o projeto evolui.*

---

## 📦 Estrutura do Repositório

```
ecommerce-microservices/
├── products-service/      # Serviço de produtos (NestJS)
├── ...                      # Outros serviços (em construção)
├── infra/                   # Infraestrutura como código (AWS CDK)
│   ├── bin/
│   └── lib/
│       ├── productsServiceStack.ts
│       ├── loadBalancerStack.ts
│       └── ...
├── docker-compose.yml      # Ambiente local
└── README.md
```

---

## 🚀 Tecnologias Utilizadas

### Backend
- **NestJS** — framework Node.js para construção de APIs escaláveis
- **TypeScript** — tipagem estática em toda a aplicação

### Infraestrutura (AWS)
- **AWS CDK v2** — provisionamento de infraestrutura como código
- **AWS ECS (Fargate)** — orquestração de containers, sem gerenciamento de servidores
- **Application Load Balancer (ALB)** e **Network Load Balancer (NLB)** — distribuição de tráfego
- **Amazon API Gateway** — exposição e roteamento das APIs
- **Amazon ECR** — registro de imagens Docker
- **Amazon CloudWatch** — monitoramento e logs centralizados

### Mensageria e Dados
- **Amazon SNS** — pub/sub para eventos entre serviços
- **Amazon SQS** — filas para processamento assíncrono e desacoplamento
- **Amazon DynamoDB** — banco de dados NoSQL para persistência
- **Amazon S3** — armazenamento de arquivos e imagens
- **AWS SDK v3** — integração dos serviços com os recursos AWS

---

## 🧩 Serviços

| Serviço | Descrição | Porta |
|---|---|---|
| `products-service` | Gerenciamento de produtos | 8080 |

> *Atualize esta tabela conforme adicionar novos serviços*

---

## 🔧 Como Executar Localmente

### Pré-requisitos
- Node.js 18+
- Docker e Docker Compose
- AWS CLI configurado (para deploy)
- AWS CDK v2 instalado globalmente (`npm install -g aws-cdk`)

### Rodando os serviços

```bash
# Clonar o repositório
git clone https://github.com/seu-usuario/ecommerce-microservices.git
cd ecommerce-microservices

# Subir os serviços localmente com Docker Compose
docker-compose up
```

### Rodando um serviço individualmente

```bash
cd products-service
npm install
npm run start:dev
```

---

## ☁️ Deploy na AWS

A infraestrutura é gerenciada via AWS CDK. Cada serviço possui sua própria stack, permitindo deploys independentes.

```bash
cd infra

# Instalar dependências
npm install

# Visualizar mudanças antes do deploy
cdk diff ProductsService

# Deploy de um serviço específico
cdk deploy ProductsService

# Deploy de toda a infraestrutura
cdk deploy --all
```

---

## 📚 Aprendizados do Projeto

Este projeto foi desenvolvido com o objetivo de praticar:

- Arquitetura de microsserviços com NestJS
- Infraestrutura como código com AWS CDK v2
- Deploy de containers com ECS Fargate
- Configuração de Load Balancers (ALB/NLB) e Security Groups
- Comunicação assíncrona entre serviços com SNS/SQS
- Persistência de dados com DynamoDB
- Armazenamento de arquivos com S3
- Integração com serviços AWS via SDK v3

---

## 👤 Autor

**Lucas**
- LinkedIn: [seu-linkedin](https://linkedin.com/in/seu-usuario)
- GitHub: [@seu-usuario](https://github.com/seu-usuario)
