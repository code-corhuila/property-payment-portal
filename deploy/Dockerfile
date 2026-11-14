FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# production (qa, main) has no test card; develop is chosen only by the composition of develop.
ARG BUILD_CONFIGURATION=production
RUN npm run build -- --configuration "$BUILD_CONFIGURATION"

FROM nginx:1.27-alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/payment/browser /usr/share/nginx/html
