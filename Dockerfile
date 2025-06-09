# 第一阶段：构建 Angular 应用
FROM alibaba-cloud-linux-3-registry.cn-hangzhou.cr.aliyuncs.com/alinux3/node:20.16  AS builder

WORKDIR /app
USER root
COPY . .
RUN npm install
RUN npm run build --prod

# 第二阶段：使用 nginx 运行构建后的应用
FROM registry.openanolis.cn/openanolis/nginx:1.14.1-8.6

# 拷贝编译好的文件到 nginx 的 html 目录
COPY --from=builder /app/dist/web-pj-front/browser /usr/share/nginx/html

# 替换默认 nginx 配置（支持 Angular 路由）
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
