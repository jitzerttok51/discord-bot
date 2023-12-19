
FROM node:20-alpine
ARG version
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY ./ ./
ENV VERSION $version
RUN echo "VERSION=${VERSION}" > .env
RUN npm install 
RUN npm run build
CMD [ "node", "/opt/app/build/main.js"]
