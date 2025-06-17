FROM node:20-slim
WORKDIR /app

# pnpm 설치
RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

ENV NODE_ENV=production
ENV GOOGLE_SERVICE_ACCOUNT_EMAIL=${GOOGLE_SERVICE_ACCOUNT_EMAIL}
ENV GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY=${GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY}
ENV GOOGLE_SHEET_ID=${GOOGLE_SHEET_ID}

COPY . .
EXPOSE 3001

USER node
CMD ["pnpm", "start"]
