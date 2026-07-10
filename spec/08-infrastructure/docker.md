# Especificação: Suporte a Docker e docker-compose

> **Spec Layer**: Infrastructure
> **ID do Débito Técnico**: TD-016
> **Versão**: 1.0.0
> **Data**: 2026-07-10

---

## Objetivo

Permitir que o projeto **Saúde Financeira** seja executado em qualquer ambiente com Docker instalado, sem necessidade de Node.js, npm ou qualquer outra dependência local. A aplicação é um SPA estático e pode ser servida por um servidor HTTP simples como o nginx.

---

## Contexto

O projeto é uma aplicação 100% estática (HTML + JS + CSS). Não possui backend, banco de dados nem processo server-side. O único papel do servidor é servir arquivos estáticos. Isso torna o Docker com nginx a solução ideal: leve, portável e sem overhead de runtime.

---

## Requisitos

- **R1**: O `docker-compose up -d` deve subir a aplicação sem nenhum passo manual adicional.
- **R2**: A porta padrão de acesso deve ser `8080` no host (mapeada para a porta `80` interna do nginx).
- **R3**: O Tailwind CSS minificado (`css/tailwind.min.css`) deve ser embutido na imagem — portanto o `npm run build:css` deve ser executado **antes** do `docker build`.
- **R4**: Arquivos desnecessários (node_modules, arquivos de teste, arquivos tmp, especificações) não devem ser incluídos na imagem.
- **R5**: A imagem deve ser baseada em `nginx:alpine` para mínimo footprint.
- **R6**: O container deve reiniciar automaticamente caso o host reinicie (`restart: unless-stopped`).

---

## Arquivos a Criar

### 1. `Dockerfile`

Estratégia: cópia direta dos arquivos estáticos para o diretório padrão do nginx.

```dockerfile
# Imagem base leve do nginx
FROM nginx:alpine

# Remove a configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuração customizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos da aplicação
COPY index.html /usr/share/nginx/html/
COPY css/ /usr/share/nginx/html/css/
COPY js/ /usr/share/nginx/html/js/
COPY public/ /usr/share/nginx/html/public/
COPY prompts/ /usr/share/nginx/html/prompts/
COPY llm_config.js /usr/share/nginx/html/

# Expõe a porta 80 do container
EXPOSE 80
```

> **Nota**: `llm_config.js` é copiado para permitir o fallback padrão de configuração da LLM. O usuário deve configurar a LLM pela interface da aplicação após o primeiro acesso.

---

### 2. `nginx.conf`

Configuração minimal do nginx para SPA estático:

```nginx
server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Compressão gzip para arquivos estáticos
    gzip on;
    gzip_types text/html text/css application/javascript application/json;

    # Cache para assets estáticos (JS, CSS, fontes, imagens)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 7d;
        add_header Cache-Control "public, immutable";
    }

    # Fallback para SPA (retorna index.html para qualquer rota)
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

### 3. `docker-compose.yml`

```yaml
version: "3.8"

services:
  saude-financeira:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: saude-financeira
    ports:
      - "8080:80"
    restart: unless-stopped
```

---

### 4. `.dockerignore`

Evita incluir arquivos desnecessários na imagem:

```
node_modules/
.git/
.gitignore
*.tmp
*.md
spec/
tests/
docs/
prompts/
package.json
package-lock.json
eslint.config.js
tailwind.config.js
CHANGELOG.md
README.md
```

> **Importante**: O arquivo `prompts/` é necessário em runtime (o agente IA carrega os prompts via `fetch`). Remova `prompts/` do `.dockerignore` se quiser que o agente financeiro funcione dentro do container.

---

### 5. Atualização de `package.json` (script auxiliar)

Adicionar script de conveniência para build Docker:

```json
{
  "scripts": {
    "dev": "lite-server",
    "lint": "eslint js/**/*.js",
    "test": "vitest run",
    "build:css": "npx @tailwindcss/cli -i css/app.css -o css/tailwind.min.css --minify",
    "docker:build": "npm run build:css && docker-compose build",
    "docker:up": "docker-compose up -d",
    "docker:down": "docker-compose down",
    "docker:logs": "docker-compose logs -f"
  }
}
```

---

## Fluxo de Build e Deploy

```
1. Pré-build (uma vez):
   npm install          # instala as devDependencies (tailwind CLI)
   npm run build:css    # gera css/tailwind.min.css minificado

2. Build da imagem:
   docker-compose build
   # ou via script: npm run docker:build

3. Subir o container:
   docker-compose up -d
   # ou via script: npm run docker:up

4. Acessar no navegador:
   http://localhost:8080
```

---

## Estrutura Final de Arquivos

```
saude_financeira/
├── Dockerfile           <- NOVO
├── nginx.conf           <- NOVO
├── docker-compose.yml   <- NOVO
├── .dockerignore        <- NOVO
├── index.html
├── llm_config.js
├── css/
│   ├── app.css
│   ├── style.css
│   └── tailwind.min.css  <- gerado por npm run build:css (antes do docker build)
├── js/
│   ├── app.js
│   ├── charts.js
│   ├── engine.js
│   ├── state.js
│   ├── storage.js
│   └── ui.js
├── public/
│   ├── chart.js
│   ├── pdf.min.js
│   └── pdf.worker.min.js
└── prompts/             <- necessario se o agente de IA for utilizado
    ├── agente.md
    ├── analise.md
    └── ...
```

---

## Considerações Importantes

### LocalStorage no Container
A persistência de dados continua usando o **LocalStorage do navegador** do usuário. O container Docker não armazena dados da aplicação — ele apenas serve os arquivos estáticos. Isso é o comportamento esperado e correto.

### Troca de Porta
Para alterar a porta de acesso, editar a linha `ports` no `docker-compose.yml`:
```yaml
ports:
  - "PORTA_DESEJADA:80"
```

### Acesso via Rede Local
Para acessar de outros dispositivos na mesma rede local (ex: smartphone, outro computador), basta acessar `http://IP_DA_MAQUINA:8080`. Não requer nenhuma configuração adicional.

### Build Multi-Stage (Alternativa Avançada)
Se desejar eliminar completamente a dependência do Node.js no host, é possível usar um build multi-stage:

```dockerfile
# Stage 1: Build do CSS
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY css/ ./css/
COPY tailwind.config.js ./
RUN npm run build:css

# Stage 2: Servidor estático
FROM nginx:alpine
COPY --from=builder /app/css/tailwind.min.css /usr/share/nginx/html/css/
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY js/ /usr/share/nginx/html/js/
COPY public/ /usr/share/nginx/html/public/
COPY prompts/ /usr/share/nginx/html/prompts/
COPY llm_config.js /usr/share/nginx/html/
EXPOSE 80
```

Esta abordagem compila o CSS dentro do próprio Docker, eliminando a necessidade de rodar `npm run build:css` manualmente.

---

## Verificação

Após subir com `docker-compose up -d`:

1. `docker ps` → verificar se o container `saude-financeira` está com status `Up`.
2. Abrir `http://localhost:8080` no navegador → a aplicação deve carregar normalmente.
3. Adicionar uma despesa e verificar se persiste após `F5` (confirma que o LocalStorage está funcionando).
4. Verificar se o tema dark/light é aplicado corretamente (confirma que os CSS estáticos estão sendo servidos).
5. `docker-compose down` → verificar se o container para corretamente.
