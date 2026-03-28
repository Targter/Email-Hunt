FROM node:20-slim

# Mandatory: Prisma engine needs openssl to connect to Supabase/Postgres from Linux
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy all project files
COPY . .

# Generate Prisma Client (uses the openssl installed above)
RUN npx prisma generate

# Build Next.js
RUN npm run build

# Default to Next.js start (Overridden by Compose for the worker)
CMD ["npm", "start"]