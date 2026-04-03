# Windows 下的 Linux 子系统: wsl (Ubuntu 24.04)

Tags: Windows, Linux, Ubuntu, wsl, 经验

由于我的电脑的原生系统为Windows，而我可能需要在写代码和打游戏（或者其他事）之间无缝切换。如果装两个系统的话，一是切换太麻烦，二是磁盘管理也麻烦，所以我直接用wsl，方便。

## 安装并开始使用

1. 开始菜单（Win键）搜索 “启用或关闭Windows功能” 确保 “适用于Linux的Windows子系统” 与 “虚拟机平台” 两个选项已经勾选。
2. 管理员powershell运行
    ```bash
    wsl --install --web-download
    ```
    等待下载。可能下的比较慢，等就完了。
3. 下载完成运行
    ```bash
    wsl --version
    ```
    确认下载成功
4. 启动wsl
    ```bash
    wsl
    ```
    输入用户名和密码。
5. 开始使用。

### 连接到已安装的claude code

直接在linux系统里重装一次（参考claude官方的安装说明）

或者使用镜像。首先启动wsl，然后执行：

```bash
# 找到claude.exe的位置
# 这里的where需要添加.exe的后缀，不然linux系统无法识别
where.exe claude
```

然后在linux中创建该路径的映射

我的路径为C:\Users\ASUS\.local\bin\claude.exe，那么则有如下输入

```bash
alias claude="/mnt/c/Users/ASUS/.local/bin/claude.exe"
```

“c”代表C盘。

到这一步，应用只会在该终端中生效，而其他终端无法生效：这是一次性的。

要实现持久化存储，则需要打开配置文件：

```bash
nano ~/.bashrc
```

翻到最下面，将上面的alias指令复制到最下面一行，然后**ctrl+x**退出，点击**Y**键确认保存，回车退出。

然后再输入“claude”就能成功运行claude code了。

### 连接到Windows平台的 docker desktop

打开docker desktop，点进设置（齿轮图标）-> Resources -> WSL integration，如果已经成功安装了linux，则应该会出现“Enable integration with my default WSL distro”以及相对应的linux版本，都勾选上即可。


## 基础操作

在我看来，熟悉Linux的标准就是：如果只给你命令行或者最基础的Ubuntu图形界面，你还能活下来吗？掌握基础的操作是在Linux系统中活下来的前提。

### 文件与目录操作

|命令|功能|示例 / 小技巧|
|---|---|---|
|`ls`|列出当前目录下的文件|`ls -alh`（显示隐藏文件以及详细信息）|
|`cd`|切换到目标目录|`cd ..`（返回上一级），`cd ~`（回家）|
|`pwd`|显示当前所在位置的绝对路径|---|
|`mkdir`|创建新文件夹|`mkdir -p a/b/c`（递归创建多级目录）|
|`touch`|创建一个空文件|`touch index.html`|
|`echo`|将指定文本或变量内容输出到标准输出|`echo "Hello World"`|
|`cp`|复制文件或文件夹|`cp -r folder_a folder_b`（复制文件夹）|
|`mv`|移动或重命名文件|`mv old.txt new.txt`|
|`rm`|删除文件或文件夹|`rm -rf`（强制递归删除，**慎用！！**）|

### 文件内容查看与编辑

- `cat`：一次性打印所有文件内容。
- `head` / `tail`：查看文件的前十行或后十行，常用`tail -f`实时监控日志。
- `less`：分页查看大文件，按`Q`手动退出。
- `nano` / `vim`：在终端中编辑文件内容。nano比较简单，vim学习路线复杂陡峭。（在nano中编辑文件后，`shift+X`退出，`Y`键保存，`Enter`键退出）（如果你陷入vim里面，可以通过`shift+;+q` -> `Enter`退出）
- `grep`：进行文本搜索，例如`cat articles/wsl.md | grep "cat"`会输出``“- `cat`：一次性打印所有文件内容。”``。
- `wc`：用于统计文件中的行数、单词数以及字节数，以`行数 单词数 字节数 文件名`的形式输出。

### 开发工具相关命令

- `code .`：在当前目录下启动VSCode。
- `explorer.exe .`：打开Windows资源管理器并定位到当前路径。
- `git`：版本控制。
- `docker`：容器管理。
- `ssh`：远程登陆服务器。
- `curl` / `wget`：发起网络请求或下载文件

### 系统监控与权限管理

- `sudo`：以管理员（root）身份执行命令。
- `top` / `htop`：查看系统进程和内存占用（htop 界面更友好，需安装）。
- `df -h`：查看磁盘剩余空间。
- `free -m`：查看内存使用情况。
- `ps -ef`：列出当前系统所有正在运行的进程。
- `kill -9 <PID>`：强制结束某个进程。

### 其他使用技巧

- `history`：查看你之前输入过的所有命令。
- `alias`：设置别名。比如 alias ll='ls -alh'。
- `find`：在文件系统中搜寻文件。
- `chmod`：修改文件权限（如 chmod +x script.sh 让脚本可执行）。
- `exit`：退出Linux子系统，回到powershell。

### 快捷键

- `TAB`：一键自动补全（当可选项较少或者没有选项时）。但是与平时写代码用的copilot不同，不会显示可选项，所以只能靠直觉，但也够用。
- `Ctrl+C`：终止当前正在运行的命令。
- `Ctrl+L`：清屏（等同于输入 clear）。

### 在WSL环境下执行Windows可执行文件

在WSL环境下，所有的Windows可执行文件其实都可以加.exe后缀在Linux终端调用。例如`ipconfig.exe`以及`notepad.exe wsl.md`。

## 账号操作

|命令|功能|示例 / 小技巧|
|---|---|---|
|`whoami`|显示当前登录的用户名|---|
|`id`|显示当前用户的 UID、GID 及所属用户组|---|
|`who` / `w`|查看当前登录系统的用户|`w` 还会显示负载和进程信息|
|`passwd`|修改当前用户的密码|`sudo passwd <用户名>` 可修改其他用户密码|
|`su`|切换到其他用户|`su - <用户名>`（`-` 表示同时切换环境变量）|
|`sudo`|以 root 身份执行单条命令|`sudo !!` 以 root 重新执行上一条命令|
|`adduser`|创建新用户（交互式，推荐）|`sudo adduser <用户名>`|
|`userdel`|删除用户|`sudo userdel -r <用户名>`（`-r` 同时删除家目录）|
|`usermod`|修改用户属性|`sudo usermod -aG sudo <用户名>`（将用户加入 sudo 组）|
|`groups`|查看当前用户所属的用户组|`groups <用户名>` 可查看指定用户|

## 指令间操作符

|符号|名称|说明|示例|
|---|---|---|---|
|`\|`|管道|将前一个命令的输出传给下一个命令|`cat file.txt \| grep "keyword"`|
|`>`|重定向（覆盖）|将输出写入文件，原有内容会被清空|`echo "hello" > file.txt`|
|`>>`|重定向（追加）|将输出追加到文件末尾|`echo "world" >> file.txt`|
|`&&`|逻辑与|前一个命令成功才执行下一个|`mkdir dist && cd dist`|
|`\|\|`|逻辑或|前一个命令失败才执行下一个|`cd dist \|\| mkdir dist`|
|`;`|顺序执行|不管前一个命令是否成功，依次执行 |`cd /tmp ; ls`|
|`&`|后台执行|让命令在后台运行，不阻塞终端 |`npm run dev &`|
