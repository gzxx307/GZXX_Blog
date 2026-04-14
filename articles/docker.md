# 容器化

Tags: docker, 技巧, 经验

最近打一些比赛遇到一些跨平台部署的需求，要在Linux系统上面运行测试在Windows系统上开发的东西，直接在Linux上面再配一次环境太麻烦了，所以看能不能用docker解决，顺便就把这个东西学了，感觉和git一样是必备的知识。还有就是把源码分发给其他人测试的时候也有类似的需求，不知道有没有用总之先学了再说。

> 原视频：[40分钟的Docker实战攻略，一期视频精通Docker](https://www.bilibili.com/video/BV1THKyzBER6)
> 
> 还有部分内容是请教AI大人的

## Docker是什么？

Docker是一种成熟高效的软件部署技术，利用容器化技术为应用程序封装独立的运行环境。每个运行环境即为一个**容器**，承载容器运行的计算机称为**宿主机**。

**容器与虚拟机的区别**

- **Docker容器**：多个容器共享一个内核，本质上还是在运行程序的内核上跑。
- **虚拟机**: 每个虚拟机都包含一个独立的操作系统的完整内核。

使用Docker容器相比虚拟机而言，更轻量，占用空间更小，启动速度也更快。

## 相关概念

### 镜像 Image

镜像是静态（不如说是编程语言中的“常量/只读”概念）的模板，包含了运行应用所需的文件系统、依赖和配置，他是不可更改的，用于创建容器

可以类比为模具

镜像由四部分组成：`[registry_address/][namespace/]image_name[:tag]`

- `registry_address`: Docker仓库的注册表地址。**特殊情况**：`docker.io`表示Docker Hub官方仓库，可省略。
- `namespace`: 命名空间，通常是作者或组织名称。**特殊情况**：`library`是Docker官方仓库的命名空间，可省略。
- `image_name`: 镜像的名称。
- `tag`: 镜像的标签名，通常表示版本号。`latest`表示最新版本，可省略。

### 容器 Container

容器是镜像的动态实例，是镜像运行起来后的状态。它是一个隔离的、可读写的进程环境

可以类比为使用模具（镜像）制作出的产品

### docker仓库 Registry

用于存放和分享docker镜像，类似github，只不过仓库中存放的是镜像（image）

## 安装

> **注意！**
> 
> Docker通常基于Linux容器化技术。在Windows和Mac电脑上，Docker需要一个Linux子系统来运行。因此，通常推荐使用Linux系统宿主机来使用Docker
> 
> 由于我的宿主机为Windows系统，且没有拥有MacOS系统的电脑，所以我这里只记录在Linux系统与Windows系统中的使用方法

### Linux系统安装

由于Docker是设计于Linux系统的，所以其在Linux系统安装非常方便。

1. **获取安装脚本**：进入任意文件夹，执行`curl -fsSL https://get.docker.com -o get-docker.sh`下载到安装脚本
2. **安装**：执行`sudo sh get-docker.sh`直接安装

然后即可使用docker了。

如果安装用户为非root用户，那么在使用docker时需要在命令前加`sudo`以获取管理员权限。

### Windows系统安装

由于Docker运行的前置条件是Linux系统，我们需要在Windows系统中安装Linux子系统（通过wsl）

如何安装wsl请看[Windows 下的 Linux 子系统: wsl (Ubuntu 24.04)](wsl.md)

安装好并验证wsl可用后：

1. **下载并安装Docker Desktop**: 从官方网站下载对应CPU架构的安装包（Windows通常为AMD64）
2. **启动Docker Desktop**: 如果要在Windows中使用docker，需要保持Docker Desktop软件运行
3. **验证安装**: 在Windows终端输入`docker --version`，若能打印版本号则表示安装成功

如果你有在Windows的wsl中使用docker的需求，可以在Docker Desktop程序中打开设置，找到**Resources**的**WSL Integration**，启用对应发行版的Linux系统（我安装的是Ubuntu24.04，那么会显示"Ubuntu-24.04选项"）即可

## 使用

### Docker镜像管理命令

#### `docker pull` 下载镜像

从Docker仓库下载镜像到本地

**示例**:

- `docker pull nginx:latest`: 从Docker Hub官方仓库下载最新版Nginx镜像（latest是上文提到的tag，通常可忽略）
- `docker pull n8n/n8n`: 从N8n的私有仓库下载N8n镜像
- `docker pull --platform=amd64 nginx`：下载指定CPU架构的镜像

#### `docker images` 列出本地镜像

列出所有已下载到本地的Docker镜像。

#### `docker rmi` 删除镜像

删除本地的Docker镜像。

要删除一个镜像，必须没有容器（无论是否在运行）使用它。如果有，你需要先删除依赖它的容器

**示例**:

- `docker rmi ubuntu:20.04`：删除指定镜像
- `docker rmi a8780b5`：删除指定ID的镜像
- `docker rmi nginx:alpine redis:latest`：删除多个镜像
- `docker rmi -f nginx`：即使有容器正在使用此镜像，也强制删除。**此操作有风险**，可能导致“悬空镜像”。在构建新镜像或删除镜像后，可能会留下一些无标签的中间层镜像。可以用`docker image prune`命令批量删除

### Docker容器管理命令

#### `docker run` 创建并运行容器

使用指定的镜像创建并运行一个容器

如果本地不存在指定镜像，`docker run`会先自动拉取镜像，再创建并运行容器。所以简单情况下，我们可以将pull和run命令简化成一个run命令

**参数**

- `-d`：让容器在后台执行，不阻塞当前终端窗口
- `-p 宿主机端口:容器内端口`：使用端口映射，因为宿主机和容器的网络不相通，所以需要映射端口。例如在容器内的80端口运行程序，宿主机的localhost:80并不能访问，此时使用`-p 80:80`创建映射就能访问了。
- `-v 宿主机目录/自定义命名卷:容器内目录`：将宿主机和容器内的文件目录绑定，称为绑定挂载，容器内与容器外对文件夹的修改会互相影响。另外，冒号前也可以填入自定义命名卷，称为命名卷挂载。
- `-e <KEY>=<VALUE>`：某些镜像的启动可以额外输入参数，可以将`-e`参数放在镜像前，就能够为镜像的启动添加参数。
- `--name <name>`：为容器命名
- `-it`：容器启动时能够交互式地进入容器内命令行（其由两部分组成，分别是`-i`保持标准输入流打开、`-t`分配一个伪终端）
- `--rm`：容器停止时删除容器
- `--restart <behavior>`：配置容器停止时的重启行为，常见的行为有：
    - `always`: 只要容器停止（包括内部错误崩溃、宿主机断电等），就会立即重启
    - `unless-stopped`: 除非手动停止容器，否则都会尝试重启。对于生产环境非常有用，可自动重启因意外停止的容器，而手动停止的容器不会再重启

**示例**

```bash
docker run -d \
  --name mysql-db \
  -p 3306:3306 \
  -v mysql_data:/var/lib/mysql \
  -e MYSQL_ROOT_PASSWORD=secret \
  -e MYSQL_DATABASE=appdb \
  --restart always \
  mysql:8.0
```

#### `docker ps` 查看正在运行的容器

输出信息包括：`Container ID`（容器唯一ID）、`Image`（基于哪个镜像创建）、`Names`（容器名称）。

**参数**

- `-a`：查看所有容器

#### `docker rm` 删除容器

删除指定名称或容器ID的容器，默认只允许删除未运行的容器。

**示例**

- `docker rm -f <ID>`：强制删除指定ID的容器，无论是否正在运行

#### 容器启停与管理

**`docker stop <容器ID或名称>`**: 停止一个正在运行的容器

**`docker start <容器ID或名称>`**: 重新启动一个已停止的容器

使用`stop`和`start`启停容器时，之前`docker run`时设置的端口映射、挂载卷、环境变量等参数都会被Docker记录并保留，无需重新设置。

**`docker inspect <容器ID或名称>`**: 查看容器的详细配置信息。输出内容比较复杂，可以用AI分析。

**`docker create <镜像名称>`**: 只创建容器，但不立即启动。若要启动，需后续执行`docker start`命令。

#### 容器内部操作与调试

**`docker logs <容器ID或名称>`**: 查看容器的运行日志，其中添加参数`-f`能够滚动查看日志，实时刷新

**`docker exec <容器ID或名称> <命令>`**：在容器内部执行Linux命令

**`docker exec -it <容器ID或名称> /bin/sh`（或`/bin/bash`）**: 可进入容器内部获得交互式命令行环境，进行文件系统查看、进程管理或深入调试。

### 命名卷

Docker可以自动创建一个存储空间，并为其命名。该存储空间可用于在宿主机中创建一个独立的文件夹与容器内连接，方便文件管理。

**创建命名卷**： `docker volume create <卷名称>`

**使用命名卷**：上文提到`docker run`的`-v`参数可以填入自定义命名卷。

你可以使用`docker volume inspect <卷名称>`输出的json文件中"Mountpoint"字段的值知晓生成的命名卷在宿主机中的真真实目录。要想进入真实目录，需要先切换成root用户

命名卷有个特点，其在第一次使用时，docker会将容器内的文件夹先同步到命名卷进行初始化，而绑定挂载则无此特性

#### 命名卷管理命令

- `docker volume ls`: 列出所有创建过的卷
- `docker volume inspect <卷名称>`: 查看卷的详细信息。
- `docker volume rm <卷名称>`: 删除一个卷
- `docker volume prune -a`: 删除所有未被任何容器使用的卷

### 匿名卷

在 Dockerfile 中用`VOLUME /容器内路径声明`（镜像级别），或在 `docker run`中使用`-v /容器内路径`（容器级别），Docker会自动在宿主机创建一个随机名称的目录与之关联

数据会持久化，但不易管理，所以匿名卷中的数据需要很好的结构化，一般用于管理持久化数据，也是管理持久化数据的首选方式

通过`docker volume prune`可以清理这些匿名卷

### 网络相关问题

解决网络问题通常用配置镜像源的方式，一般用科学上网也有大概率出问题

- **Linux**: 修改`/etc/docker/daemon.json`文件，添加`"registry-mirrors": ["https://<your-mirror-address>"]`，然后重启Docker服务（`sudo systemctl restart docker`）。
- **Windows/Mac**: 在Docker Desktop的设置中，进入“Docker Engine”配置项，在`registry-mirrors`中添加镜像站地址，点击“Apply & Restart”。例如：
    ```json
    {
    "builder": {
      "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
      }
    },
    "experimental": false,
    "registry-mirrors": [
        "https://docker.m.doucloud.io",
        "https://docker.lpanel.live",
        "https://hub.rat.dev"
      ]
    }
    ```

## 使用Dockerfile构建镜像

Dockerfile是一个文本文件，详细列出了如何制作Docker镜像的步骤和指令，可类比为制作模具的图纸

文件命名一般直接命名为不带后缀名的Dockerfile，放置在你想要容器化的文件夹下。`docker build`命令默认会在指定目录下寻找这个文件。

> 另外，你也可以使用`Dockerfile.build`等名称，通常是为了区分不同目的的构建文件，此时需要使用-f参数显式指定：`docker build -f Dockerfile.build`

另外，为了在执行`COPY`等一些涉及到文件操作的命令时，可能会涉及到某些大文件，这些大文件如果被打包进容器中会导致包体过大。此时可以使用`.dockerignore`文件忽略掉所有你不希望涉及的大文件和文件夹，用法与.gitignore类似。与Dockerfile文件放在同级目录

> 另外，`.dockerignore`更重要的一个作用是提高构建缓存命中率。例如，如果忽略经常变动的node_modules或本地日志，那么 COPY . .时就不会因为它们的改变而导致缓存失效，从而加速构建

### Dockerfile 基本结构与指令

| 指令 | 用途 | 使用时机 |
|------|------|----------|
| **FROM** | 指定基础镜像 | 必须，且为第一条指令 |
| **ARG** | 定义构建参数 | 在需要参数化的地方 |
| **ENV** | 设置环境变量 | 在需要设置环境变量的地方 |
| **WORKDIR** | 设置工作目录 | 在需要改变当前目录时 |
| **COPY** | 复制文件 | 复制本地文件到镜像 |
| **ADD** | 复制文件（带特殊功能） | 需要自动解压或从URL下载时 |
| **RUN** | 执行命令 | 安装软件、编译代码等构建步骤 |
| **USER** | 切换用户 | 在需要非root运行的地方 |
| **EXPOSE** | 声明端口 | 声明应用监听的端口 |
| **VOLUME** | 定义匿名卷 | 需要持久化数据时 |
| **HEALTHCHECK** | 健康检查 | 定义容器健康状态检查 |
| **LABEL** | 添加元数据 | 添加镜像描述信息 |
| **ENTRYPOINT** | 入口点 | 定义容器启动时的可执行文件 |
| **CMD** | 默认命令 | 为ENTRYPOINT提供默认参数 |
| **SHELL** | 改变shell | 需要改变默认shell时 |
| **STOPSIGNAL** | 停止信号 | 需要自定义停止信号时 |
| **ONBUILD** | 触发器 | 构建基础镜像时设置子镜像构建指令 |

> 关于`ENTRYPOINT`和`CMD`的关系，如果定义了`ENTRYPOINT`，则`CMD`的内容会作为参数传递给`ENTRYPOINT`
> 
> 执行`docker run <image> <args>`时，`<args>`会覆盖 `CMD`，但不会覆盖`ENTRYPOINT`（除非使用`--entrypoint`参数覆盖）
> 
> 最佳实践：将可执行程序定义为`ENTRYPOINT`，将默认参数定义为`CMD`


#### 完整示例

```dockerfile
# 多阶段构建示例
# 阶段1：构建阶段
FROM node:18 AS builder

# 构建参数
ARG NPM_REGISTRY=https://registry.npmjs.org/

# 工作目录
WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 设置 npm 源
RUN npm config set registry $NPM_REGISTRY

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY src/ ./src/
COPY tsconfig.json ./

# 构建
RUN npm run build

# 阶段2：运行阶段
FROM node:18-alpine

# 元数据
LABEL maintainer="dev@example.com"
LABEL version="1.0.0"

# 环境变量
ENV NODE_ENV=production
ENV PORT=3000

# 非 root 用户
USER node

# 工作目录
WORKDIR /home/node/app

# 从构建阶段复制文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=node:node package.json ./

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# 暴露端口
EXPOSE 3000

# 数据卷
VOLUME /home/node/app/logs

# 启动命令
CMD ["node", "dist/index.js"]

# 停止信号
STOPSIGNAL SIGTERM
```

#### 指令顺序最佳实践

从最不可能变化的指令开始，到最可能变化的指令

```dockerfile
# 好的顺序示例
FROM base:tag
ARG BUILD_DATE
LABEL org.label-schema.build-date=$BUILD_DATE
ENV APP_HOME=/app
WORKDIR $APP_HOME
COPY package*.json ./
RUN npm ci --only=production
COPY src/ ./src/
USER node
EXPOSE 3000
CMD ["node", "src/index.js"]
```

### 使用`docker build`构建镜像

根据当前所在目录下的Dockerfile构建Docker镜像

**语法**：`docker build -t <镜像名称>[:<版本号>] <Dockerfile所在目录>`

**示例**：`docker build -t my_image .`

### 将镜像推送至Docker Hub

1. **登录Docker Hub**：`docker login`
2. **重新标记镜像**：`docker tag <本地镜像名称> <你的用户名>/<镜像名称>[:<版本号>]`（在推送时镜像名称必须包含用户名作为命名空间，所以需要重新对镜像进行标记）
3. **推送镜像**：`docker push <你的用户名>/<镜像名称>[:<版本号>]`

如果在Docker Hub网站上可搜索到自己推送的镜像，其他用户即可通过`docker pull`下载使用

## Docker网络模式

虽然每个容器与宿主机之间的网络是默认隔离的，但是容器之间却拥有一个或多个独立的网络，或者可以将容器与宿主机之间的网络打通

通常在需要运行容器时以参数的形式传入

Docker的网络有多种模式：

### Bridge 桥接模式

桥接模式为默认模式，所有容器的网络默认为此网络模式。

在此网络中，每个容器会被分配一个内部IP地址（通常是`172.17.x.x`开头），同一Bridge网络内的容器可以通过内部IP地址互相访问。

#### 自定义子网

Docker可以创建子网，在桥接模式的默认网络外新增一个子网络，不同子网之间默认隔离。

同一子网内的容器可以使用**容器名称**互相访问（Docker内部DNS机制）。

- **创建**: `docker network create <子网名称>`
- **加入**: `docker run --network <子网名称> ...`

#### Host 主机模式

在该模式下，Docker容器直接共享宿主机的网络命名空间，容器直接使用宿主机的IP地址，无需端口映射（`-p`），容器内的服务直接运行在宿主机的端口上，通过宿主机的IP和端口即可访问。

一般用于解决一些复杂的网络问题

**使用**：`docker run --network host ...`

#### None 无网络模式

容器不连接任何网络，完全隔离

**使用**: `docker run --network none ...`

### 网络管理命令

- `docker network ls`: 列出所有Docker网络（包括默认的bridge、host、none以及自定义子网）
- `docker network rm <网络名称>`: 删除自定义子网（默认网络不可删除）

## Docker Compose 多容器编排

当一个完整的应用由多个模块（如前端、后端、数据库）组成时，若将所有模块打包成一个巨大容器，会导致故障蔓延、伸缩性差。若每个模块独立容器化，则管理多个容器（创建、网络配置）会增加复杂性，此时我们引入`Docker Compose`

Docker Compose是一种轻量级的容器编排技术，用于管理多个容器的创建和协同工作，适合个人使用和单机运行的轻量级容器编排需求

**关于网络**，Docker Compose会自动为每个Compose文件创建一个默认子网，文件中定义的所有容器都会自动加入此子网，并可通过服务名称互相访问


### 创建

核心为YAML文件（通常命名为`docker-compose.yml`），使用该YAML文件配置多服务应用。

关于YAML文件的内容结构，可视为多个`docker run`命令按照特定格式组织在一个文件中。

- `services`: 顶级元素，每个服务对应一个容器
- 服务名称（如`mongodb`）: 对应`docker run`中的`--name`，作为容器名的一部分
- `image`: 对应`docker run`中的镜像名
- `environment`: 对应`docker run`的`-e`参数
- `volumes`: 对应`docker run`的`-v`参数
- `ports`: 对应`docker run`的`-p`参数
- `depends_on`: 定义容器的启动顺序，确保依赖服务先启动

> 关于`depends_on`，它只控制启动顺序，并不保证依赖的服务（如数据库）在启动时就已经准备好接受连接。对于需要等待服务完全就绪的场景，可能需要配合使用`healthcheck`和` condition`参数，或者使用脚本在应用内重试连接

### 相关命令

`docker compose up`: 启动YAML文件中定义的所有服务（容器）

- 添加参数`-d`: 后台运行
- 参数`-f <文件名.yml>`加在`up`前面：指定非标准文件名的Compose文件
- 会自动创建子网和容器

`docker compose down`: 停止并删除由Compose文件定义的所有服务和网络

`docker compose stop`: 仅停止服务，不删除容器

`docker compose start`: 启动已停止的服务


