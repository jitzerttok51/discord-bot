
FROM node:20-alpine
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY ./ ./
RUN npm install 
RUN npm run build
CMD [ "node", "/opt/app/build/main.js"]
