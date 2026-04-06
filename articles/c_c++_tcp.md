# C/C++: TCP协议实现网络通讯

Tags: C/C++, TCP, 网络

## 服务端的流程

1. 创建socket套接字（可以理解为网络接口）
2. 给socket绑定一个端口号
    > 一台电脑上可以有多个服务器。
    >
    > IP地址用于指定电脑，端口号用于指定电脑上的某个服务器
3. 给socket开启监听属性
4. 等待客户端链接
5. 开始通讯

### 代码示例：基本固定的写法

```cpp
#include <stdio.h>
#include <string.h>
#include <WinSock2.h> //包含头文件
#include <WS2tcpip.h>
#pragma comment(lib, "Ws2_32.lib") //包含链接库文件

int main()
{
    // windows上使用网络功能需要开启网络权限
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);


    // 创建socket套接字
    // SOCKET socket(
    //     int af,        // 协议地址族 IPV4/IPV6 -> AF_INET/AF_INET6
    //     int type,      // 类型 流式协议/帧式协议 -> SOCK_STREAM/SOCK_DGRAM
    //     int protocol   // 保护协议 我们使用的是TCP协议，所以填0就行
    // );
    SOCKET listen_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (listen_socket == INVALID_SOCKET)
    {
        printf("create listen socket failed! Error Code : %d\n", WSAGetLastError());
        return -1;
    }
    printf("create listen socket success!\n");

    // 绑定IP地址和端口号
    //struct sockaddr_in
    //{
    //    ADDRESS_FAMILY sin_family;   // 协议地址族
    //    USHORT sin_port;             // 端口号
    //    IN_ADDR sin_addr;            // IP地址
    //    CHAR sin_zero[8];            // 保留字节
    //};
    struct sockaddr_in local = { 0 };
    local.sin_family = AF_INET;
    local.sin_port = htons(8080); // 端口号
    // local.sin_addr.s_addr = htonl(INADDR_ANY); // IP地址
    // INADDR_ANY表示监听所有IP地址 htonl表示将主机字节序转换为网络字节序
    local.sin_addr.s_addr = inet_addr("127.0.0.1"); // IP地址
    // inet_addr将点分十进制IP地址（以字符串形式储存）转换为网络字节序的二进制IP地址
    if (bind(listen_socket, (struct sockaddr*)&local, sizeof(local)) == -1)
    {
        printf("bind failed! Error Code : %d\n", WSAGetLastError());
        return -1;
    }
    printf("bind success!\n");
    

    // 监听
    if (listen(listen_socket, 10) == -1)
    {
        printf("listen failed! Error Code : %d\n", WSAGetLastError());
        return -1;
    }
    printf("listen success!\n");


    // 等待客户端链接
    // SOCKET accept(
    //     SOCKET s,                 // 监听套接字
    //     struct sockaddr* addr,    // 返回类型的参数，返回客户端地址
    //     int* addrlen              // 客户端地址长度
    // );
    // accept函数会阻塞程序，直到有客户端链接
    // 这个函数返回的是客户端的socket，这个socket才是可以用来和客户端进行通信的
    while (1) // 如果想和多个客户端链接，就需要使用循环
    {
        printf("waiting for client...\n");
        SOCKET client_socket = accept(listen_socket, NULL, NULL);
        if (client_socket == INVALID_SOCKET) continue;


        // 开始通讯
        printf("client connected!\n");
        while (1)
        {
            // 接收数据
            char buffer[1024] = { 0 };
            // int recv(
            //     SOCKET s,        // 客户端socket
            //     char* buf,       // 接收数据的缓冲区（存到哪里）
            //     int len,         // 接受的长度
            //     int flags        // 接收方式（填0就可以）
            // );
            int ret = recv(client_socket, buffer, sizeof(buffer), 0);
            if (ret <= 0) break;
            printf("recv : %s\n", buffer);

            // 发送数据
            send(client_socket, buffer, strlen(buffer), 0);
        }

        printf("client disconnected!\n");
    }
    // 关闭链接
    closesocket(listen_socket);
    return 0;
}
```

## 客户端流程

1. 创建socket套接字
2. 连接服务器
3. 开始通讯

### 代码示例：配合上文一起食用

```cpp
#include <stdio.h>
#include <WinSock2.h>
#pragma comment(lib,"ws2_32.lib")


int main()
{
    WSADATA wsaData;
    WSAStartup(MAKEWORD(2, 2), &wsaData);

    // 创建套接字
    SOCKET client_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (client_socket == INVALID_SOCKET) 
    {
        printf("create socket failed ! Error Code : %d\n", WSAGetLastError());
        return -1;
    }

    // 连接服务器
    struct sockaddr_in target;
    target.sin_family = AF_INET;
    target.sin_port = htons(8080);
    target.sin_addr.s_addr = inet_addr("127.0.0.1");

    if (connect(client_socket, (struct sockaddr*)&target, sizeof(target)) == SOCKET_ERROR)
    {
        printf("connect failed ! Error Code : %d\n", WSAGetLastError());
        return -1;
    }

    // 开始通讯
    while (1)
    {
        char sbuffer[1024] = { 0 }; // 发送缓冲区
        printf("please input message : ");
        scanf("%s", sbuffer);
        if (send(client_socket, sbuffer, strlen(sbuffer), 0) == SOCKET_ERROR)
        {
            printf("send failed ! Error Code : %d\n", WSAGetLastError());
            return -1;
        }

        char rbuffer[1024] = { 0 }; // 接收缓冲区
        int ret = recv(client_socket, rbuffer, 1024, 0);
        if (ret == SOCKET_ERROR)
        {
            printf("recv failed ! Error Code : %d\n", WSAGetLastError());
            return -1;
        }
        else if (ret == 0)
        {
            printf("server close connection !");
            break;
        }
        printf("recv message : %s\n", rbuffer);
    }

    closesocket(client_socket);

    return 0;
}
```

## 优化：支持多线通讯

在上文中，我们使用了while循环的方式维护client_socket，来保证我们能够与客户端进行通讯的同时，不会断开线程。但这样会出现一个问题：如果有多个人尝试连接该服务端时，会因为第一个连接的人阻塞了主线程，导致其他人的访问没有反应。因此我们使用IO复用/多线程的方式解决这一问题。

### 多线程（不建议在大型项目中使用）

线程入口函数示例
```cpp
// 线程启动入口
DWORD WINAPI thread_func(LPVOID lpParam)
{
    SOCKET client_socket = *(SOCKET*)lpParam; // 获取传入的客户端socket
    free(lpParam); // 释放地址
    // 开始通讯
    printf("client connected!\n");
    // 接收用户名
    char client_name[256] = { 0 };
    recv(client_socket, client_name, sizeof(client_name), 0);
    while (1)
    {
        // 接收数据
        char buffer[1024] = { 0 };
        // int recv(
        //     SOCKET s,        // 客户端socket
        //     char* buf,       // 接收数据的缓冲区（存到哪里）
        //     int len,         // 接受的长度
        //     int flags        // 接收方式（填0就可以）
        // );
        int ret = recv(client_socket, buffer, sizeof(buffer), 0);
        if (ret <= 0) break;
        printf("%s : %s\n", client_name, buffer);

        // 发送数据
        send(client_socket, buffer, strlen(buffer), 0);
    }

    printf("client disconnected!\n");
    return 0;
}
```

此时将服务端中等待用户连接的循环改为

```cpp
    while (1)
    {
        printf("waiting for client...\n");
        SOCKET client_socket = accept(listen_socket, NULL, NULL);
        if (client_socket == INVALID_SOCKET) continue;

        // 为socket分配内存空间，防止线程执行时socket被释放
        SOCKET* socketfd = (SOCKET*)malloc(sizeof(SOCKET));
        *socketfd = client_socket;
        // 创建线程
        CreateThread(NULL, 0, thread_func, socketfd, 0, NULL);
    }
```