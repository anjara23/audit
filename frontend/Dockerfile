# build
FROM node:20-alpine AS builder

WORKDIR /app

# copie package.json en premier 
COPY package*.json ./
RUN npm install

# copie du reste et builder
COPY . .
RUN npm run build

# serveur de production avec Nginx (efa buildé le code de tsy mila node intsony dcp manao image iray indray)
FROM nginx:alpine

# copier le build dans le dossier servi par nginx
COPY --from=builder /app/dist /usr/share/nginx/html

#config nginx pour react router
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]