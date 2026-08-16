FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    imagemagick \
    ghostscript \
    && rm -rf /var/lib/apt/lists/* \
    && sed -i '/pattern="PDF"/d' /etc/ImageMagick-6/policy.xml

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

EXPOSE 3000

CMD ["node", "src/server.js"]
