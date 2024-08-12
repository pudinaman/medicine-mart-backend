# Stage 1: Build
FROM node:18-alpine AS build

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application if applicable
# RUN npm run build

# Stage 2: Runtime
FROM node:18-alpine

WORKDIR /app

# Copy only the necessary files from the build stage
COPY --from=build /app /app
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json

# Clean up unused files (optional)
RUN npm cache clean --force && \
    rm -rf /root/.npm

# Set environment variable
ENV PORT=4000

# Expose the port
EXPOSE 4000

# Start the application
CMD ["npm", "start"]
