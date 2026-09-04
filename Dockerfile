# Stage 1: Build Angular application
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build


# Stage 2: Serve Angular application using Nginx
FROM nginx:alpine

COPY --from=build /app/dist/100-days/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]