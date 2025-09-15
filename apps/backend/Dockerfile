FROM node:20-alpine

WORKDIR /home/site/wwwroot

COPY package.json package-lock.json* ./

RUN npm ci --omit=dev || npm i --only=production

COPY src ./src

EXPOSE 8080

ENV NODE_ENV=production
ENV PORT=8080

CMD ["node", "src/app.js"]


