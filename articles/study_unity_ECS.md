# ECS思想并在Unity中使用

Tags: Unity, 知识, 性能优化

最近正在筹划做一个工厂类游戏的demo，而众所周知工厂类游戏的对象极多，大多数物体的逻辑又比较简单，所以在项目前期设计性能优化是很有必要的。

在Unity中，我们一般使用JobSystem以及其他的一些库来共同实现这一功能，这个文档也基本主要是使用Unity来进行研究和实现的。UE中对应的应该是mass系统，其实现方式我也不太清楚，但应该和Unity的实现比较不同，这里不做讨论。

> 几个比较好的教学视频
>
> [Unity ECS 是什么？如何让你的游戏性能起飞？【Unity 小技巧】](https://www.bilibili.com/video/BV1rcRRYAEeY/?spm_id_from=333.337.search-card.all.click&vd_source=0748f696e1bda1e6909280682b804700)
>
> [【游戏优化与设计模式】19 ECS框架详解](https://www.bilibili.com/video/BV1XTxuzfEB9/?spm_id_from=333.337.search-card.all.click&vd_source=0748f696e1bda1e6909280682b804700)

## ECS是什么？

ECS即**Entity-Component-System**，这是一种**面向数据**的架构设计模式，或称作“编程范式”，类似MVC（Model-View-Controller）。在除游戏编程以外的方向也可以使用类似的框架。

与传统的面向对象编程（OOP）不同，其将代码主要分为三大类：

- Entity：类似于Unity中的GameObject，相当于是一个物体的“个体”，但其不直接存放数据。大多数情况下其以“数字”的形式存在，相当于给每个物体一个“编号”，其用来表示这个物体“存在”。
- Component：可以联系OOP中“组合”的思想，Component即“组件”，一个Entity可以具有多个Component，不同Entity拥有的Component不同。每个Component都是一种数据，其不包含行为。
- System：其中存放处理数据的逻辑，用于处理每个Entity的某一个Component的更新逻辑。



