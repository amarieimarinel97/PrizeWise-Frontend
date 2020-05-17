FROM node:12.16.3-alpine AS reactApp
COPY . /project
ENV PATH /project/fe/node_modules/.bin:$PATH
WORKDIR /project/fe
ENV REACT_APP_API_BASE_URL=http://localhost:8085/api

RUN npm install
RUN npm install react-scripts@3.4.1 -g
RUN npm run build


FROM nginx:1.17.0-alpine
COPY --from=reactApp /project/fe/build /var/www
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80

ENTRYPOINT ["nginx","-g","daemon off;"]


#docker build -t react:tag .
#docker run --network diploma-proj-net -it -p 81:80 -p:8085:8085 --name diploma-proj-react --rm react:tag