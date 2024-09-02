FROM node:16-alpine AS reactApp
COPY . /project
ENV PATH /project/fe/node_modules/.bin:$PATH
WORKDIR /project/fe

RUN npm install

EXPOSE 3000
CMD ["npm", "start"]


#docker build -t react:tag .
#docker run --network diploma-proj-net -it -p 81:80 -p:8085:8085 --name diploma-proj-react --rm react:tag
