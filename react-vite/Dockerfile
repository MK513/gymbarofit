FROM node:22-alpine

WORKDIR /app

# Copy package files first (layer cache: npm install only reruns when deps change)
COPY package.json package-lock.json* ./

RUN npm install

# Copy the rest of the project (src/ and public/ are overridden by volume mounts at runtime)
COPY . .

EXPOSE 5173

# --host 0.0.0.0 makes Vite listen on all interfaces, not just 127.0.0.1
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
