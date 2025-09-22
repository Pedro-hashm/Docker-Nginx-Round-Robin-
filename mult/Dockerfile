# 1 Imagem do Node.js
FROM node:20-alpine

# Define a pasta do app dentro do container
WORKDIR /app

# Copia package.json e package-lock.json (pra instalar dependências antes do código)
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código do projeto
COPY . .

# Expõe a porta que o app vai rodar
EXPOSE 3000

# Comando pra rodar o app
CMD ["node", "index.js"]