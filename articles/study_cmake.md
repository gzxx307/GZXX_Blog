# CMake简明教程

Tags: CMake, C++, 经验

## 前言

我是在windows系统上实践的cmake的使用和实现，但实际上linux才是最推荐去进行cmake的学习和使用的

因为cmake在工作时会生成一大堆文件，生成文件时会自动适配你的系统。但实际上这些文件都是人类可读的，这意味着当某些地方发生错误时，你可以通过查看这些文件来找到在cmake相对较底层的地方的问题。然而众所周知，linux开源而windows闭源，这导致你可以通过linux的源码或api来理解cmake生成的文件的每一个作用，然而windows不行

另外，我使用的IDE为vscode，编译器为mingw64的g++（如果是c就会用gcc）。当然IDE也可以用vs，编译器也可以vs提供的，只是vscode和命令行用习惯了，所以下面写的基本都是用vscode的

> 参考：
> 
> 菜鸟教程[CMake教程](https://www.runoob.com/cmake/cmake-tutorial.html)
> 
> bilibili [现代C++: CMake简明教程](https://www.bilibili.com/video/BV1xa4y1R7vT)

## CMake是什么

CMake是一种自动化构建基于c/c++编写的程序的工具

CMake本身是开源的，仓库（官方镜像）[https://github.com/Kitware/CMake](https://github.com/Kitware/CMake)

如果依赖c/c++语言自身进行编译，对于大型文件来说，处理依赖和跨平台支持之类的东西会非常繁琐，所以使用CMake作为构建工具。CMake首先通过读取CMakeLists.txt脚本，然后根据你当前的操作系统和选择的编译器生成对应平台的原生构建文件（例如在linux或者windows的mingw中生成Makefile，windows里没有mingw或者gcc/g++，那么就使用vs的工具链，生成的是sln解决方案文件）

## 前提

配置好c/c++，至少能让一个hello world程序运行

## 下载

### Windows

1. 在CMake官网里下载.msi文件
2. 运行安装，安装过程中可以选择将cmake添加到系统环境变量，或者也可以自己设置

### Linux

```bash
sudo apt update
sudo apt install cmake
```

### 验证下载成功

在终端中执行

```bash
cmake --version
```

成功输出版本号即下载成功

## 核心文件：CMakeLists.txt

CMakeLists.txt是cmake在目标工作目录里读的第一个文件，这个文件里包含了所有的自定义构建规则、依赖管理和编译选项

CMake项目是基于CMakeLists.txt构建的，在CMakeLists.txt中我们用到的就是CMake Language。

每个CMake项目通常包含一个或多个CMakeLists.txt文件

**基本语法规则**

- 命令不区分大小写（比如`project()`和`PROJECT()`都可以），但通常使用全小写或全大写
- 注释使用`#`，没有块注释

### 

## 第一个由cmake构建的程序

### 源码

`main.cpp`

```cpp
#include <iostream>
int main()
{
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
```

`CMakeLists.txt`

```txt
cmake_minimum_required(VERSION 3.20) # 指定CMake的最低版本要求
project(study_cmake) # 定义项目名称
add_executable(study_cmake main.cpp) # 添加可执行文件，指定源文件为main.cpp
```

### 生成cmake文件

创建好这两个文件后，如果你的vscode安装了CMake扩展，那么vscode会自动识别到你创建了CMakeLists.txt文件，然后询问你希望使用哪一个编译器。在选择好编译器后，vscode就 会帮你执行cmake指令，在工作目录的build文件夹下生成cmake的所有文件

但如果你坚持手搓，那么最佳实践是先创个`build`文件夹，进入该文件夹，然后再让cmake找到CMakeLists.txt，这样cmake就会在build里生成cmake文件了

```bash
# 创建build文件夹
mkdir build
# 进入build文件夹
cd build
# 在build文件夹的上一级文件夹里找到CMakeLists.txt并构建
cmake ..
```

或者使用`-B`参数指定生成cmake文件的位置

```bash
# 在build目录中初始化
cmake -B build
```

### 构建

在build目录里运行构建

```bash
cmake --build
```

或者指定Makefile（或者sln）文件的路径

```bash
# 在根目录里指定刚刚创建的build文件夹
cmake --build build
```

这样就生成了一个可执行文件

## 常见指令

