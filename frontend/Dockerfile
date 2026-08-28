# ── Imagem base leve do nginx ─────────────────────────────────────────────────
FROM nginx:alpine

# Remove a configuracao padrao do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia a configuracao customizada
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ── Arquivos estaticos da aplicacao ───────────────────────────────────────────
COPY index.html        /usr/share/nginx/html/
COPY favicon.svg       /usr/share/nginx/html/
COPY llm_config.js     /usr/share/nginx/html/
COPY css/              /usr/share/nginx/html/css/
COPY js/               /usr/share/nginx/html/js/
COPY public/           /usr/share/nginx/html/public/

# Expoe a porta 80 do container
EXPOSE 80
