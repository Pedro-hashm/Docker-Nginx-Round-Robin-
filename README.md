Projeto de Arquitetura de Microserviços com Balanceamento de Carga

Este projeto é uma demonstração de uma arquitetura de microserviços utilizando Docker para containerização, Nginx como API Gateway e balanceador de carga, e dois serviços distintos desenvolvidos com tecnologias diferentes: um em Python/Flask e outro em Node.js/Express.

O objetivo principal é simular um ambiente distribuído, adicionando um novo microserviço de multiplicação (/mult) a uma arquitetura existente e configurando um balanceamento de carga ponderado (Round Robin com pesos) e um servidor de backup, conforme os requisitos da atividade.

Índice

    Arquitetura do Projeto

    Tecnologias Utilizadas

    Pré-requisitos

    Estrutura de Arquivos

    Como Executar o Projeto

    Como Usar a API

    Detalhes da Configuração do Nginx

    Autor

Arquitetura do Projeto

A arquitetura é composta pelos seguintes componentes:

    Nginx (API Gateway/Load Balancer):

        É o ponto de entrada único para todas as requisições externas.

        Recebe as requisições e as roteia para o microserviço apropriado.

        Para o endpoint /mult, distribui a carga entre três instâncias do mult-service seguindo uma política de Round Robin ponderada.

    Microserviço de Multiplicação (mult-service):

        Desenvolvido em Node.js com Express.

        Responsável pelo endpoint /mult.

        Recebe dois parâmetros (op1 e op2) e retorna o resultado da multiplicação.

        É replicado em 3 contêineres para garantir alta disponibilidade e escalabilidade, com a seguinte configuração de balanceamento:

            Instância 1: weight=3 (recebe 3x mais tráfego).

            Instância 2: weight=1.

            Instância 3: backup (só recebe requisições se as outras duas estiverem indisponíveis).

    Microserviço de Ping (ping-service):

        Desenvolvido em Python com Flask.

        Responsável pelo endpoint /ping para verificar a saúde do sistema ou como exemplo de serviço já existente.

    Docker e Docker Compose:

        Todos os serviços, incluindo o Nginx, são executados em contêineres Docker isolados.

        O docker-compose.yml orquestra a construção das imagens e a execução de todos os contêineres, facilitando a configuração do ambiente completo com um único comando.

Tecnologias Utilizadas

    Containerização: Docker, Docker Compose

    API Gateway & Load Balancer: Nginx

    Microserviço mult-service: Node.js, Express.js

    Microserviço ping-service: Python 3, Flask

Pré-requisitos

Para executar este projeto, você precisará ter instalado em sua máquina:

    Docker

    Docker Compose (geralmente já vem com o Docker Desktop)

Estrutura de Arquivos

A estrutura do projeto deve se parecer com a seguinte:

/projeto-microservicos
├── mult-service/
│   ├── Dockerfile
│   ├── index.js
│   └── package.json
├── ping-service/
│   ├── Dockerfile
│   ├── app.py
│   └── requirements.txt
├── nginx/
│   ├── Dockerfile
│   └── nginx.conf
├── docker-compose.yml
└── README.md

Como Executar o Projeto

Siga os passos abaixo para colocar toda a arquitetura no ar.

1. Clone o repositório (se aplicável):
Bash

git clone <url-do-seu-repositorio>
cd projeto-microservicos

2. Suba os contêineres:

Na raiz do projeto (onde o arquivo docker-compose.yml está localizado), execute o seguinte comando para construir as imagens e iniciar todos os serviços em segundo plano:
Bash

docker-compose up --build -d

3. Verifique se os serviços estão rodando:

Você pode listar os contêineres ativos para confirmar que tudo subiu corretamente:
Bash

docker-compose ps

A saída deve mostrar os contêineres nginx, ping-service, e as três réplicas do mult-service em execução.

4. Para parar a execução de todos os contêineres:

Quando terminar de usar, execute o comando abaixo para parar e remover os contêineres:
Bash

docker-compose down

Como Usar a API

Após iniciar os serviços, a API estará acessível em http://localhost:8080.

Endpoint de Multiplicação (/mult)

Este endpoint calcula o produto de dois números. O Nginx fará o balanceamento de carga entre as 3 instâncias do serviço de multiplicação.

    URL: http://localhost:8080/mult

    Método: GET

    Query Parameters:

        op1: O primeiro número.

        op2: O segundo número.

    Exemplo de uso (usando cURL):

Bash

curl "http://localhost:8080/mult?op1=7&op2=6"

    Resposta esperada:

JSON

{
  "resultado": 42
}

Endpoint de Ping (/ping)

Este endpoint serve para verificar se o serviço de ping está funcionando.

    URL: http://localhost:8080/ping

    Método: GET

    Exemplo de uso (usando cURL):

Bash

curl http://localhost:8080/ping

    Resposta esperada:

JSON

{
  "message": "pong"
}

Detalhes da Configuração do Nginx

O coração do balanceamento de carga está no arquivo nginx/nginx.conf. A diretiva upstream é usada para definir o grupo de servidores do mult-service e aplicar a política de distribuição.

Um trecho da configuração relevante se parece com:
Nginx

# nginx/nginx.conf

# ...

http {
    # Define o grupo de servidores para o microserviço de multiplicação
    upstream mult_servers {
        server mult-service-1:3001 weight=3;
        server mult-service-2:3002 weight=1;
        server mult-service-3:3003 backup;
    }

    server {
        listen 80;

        # Rota para o serviço de multiplicação
        location /mult {
            proxy_pass http://mult_servers;
        }

        # Rota para o serviço de ping
        location /ping {
            proxy_pass http://ping-service:5000;
        }
    }
}

    upstream mult_servers: Define um grupo de servidores chamado mult_servers.

    weight=3: O servidor mult-service-1 receberá aproximadamente 75% das requisições (3 de cada 4).

    weight=1: O servidor mult-service-2 receberá aproximadamente 25% das requisições (1 de cada 4).

    backup: O servidor mult-service-3 só será utilizado se mult-service-1 e mult-service-2 estiverem indisponíveis.