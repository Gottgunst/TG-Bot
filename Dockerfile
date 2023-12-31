FROM node:lts
RUN mkdir /app
WORKDIR /app
ADD package.json package.json
RUN npm install
ADD . .
ENV NODE_ENV production
RUN npm run build
RUN npm prune --production
CMD ["npm", "start"]
EXPOSE 4242
