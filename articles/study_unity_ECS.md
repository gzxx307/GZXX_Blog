# ECS思想与其在Unity中的使用

Tags: Unity, 知识, 性能优化

最近正在筹划做一个工厂类游戏的demo，而众所周知工厂类游戏的对象极多，大多数物体的逻辑又比较简单，所以在项目前期设计性能优化是很有必要的。

在Unity中，我们一般使用JobSystem以及其他的一些库来共同实现这一功能，这个文档也基本主要是使用Unity来进行研究和实现的。UE中对应的应该是mass系统，其实现方式我也不太清楚，但应该和Unity的实现比较不同，这里不做讨论。

> 几个比较好的教学视频
>
> [Unity ECS 是什么？如何让你的游戏性能起飞？【Unity 小技巧】](https://www.bilibili.com/video/BV1rcRRYAEeY/?spm_id_from=333.337.search-card.all.click&vd_source=0748f696e1bda1e6909280682b804700)
>
> [【游戏优化与设计模式】19 ECS框架详解](https://www.bilibili.com/video/BV1XTxuzfEB9/?spm_id_from=333.337.search-card.all.click&vd_source=0748f696e1bda1e6909280682b804700)
>
> [ECS可能正在毁掉你的游戏…](https://www.bilibili.com/video/BV1Kyut6JEvS?spm_id_from=333.788.videopod.sections&vd_source=0748f696e1bda1e6909280682b804700)

## ECS是什么？

简单来说，ECS就是把物体、数据和逻辑隔离开来的一种设计方式，便于批量高效的处理大量简单对象。

### ECS概述

ECS即**Entity-Component-System**，这是一种**面向数据（DOD）**的架构设计模式，或称作“编程范式”，类似MVC（Model-View-Controller）。在除游戏编程以外的方向也可以使用类似的框架。

与传统的面向对象编程（OOP）不同，其将代码主要分为三大类：

- Entity：类似于Unity中的GameObject，相当于是一个物体的“个体”，但其不直接存放数据。大多数情况下其以“数字”的形式存在，相当于给每个物体一个“编号”，其用来表示这个物体“存在”。
- Component：可以联系OOP中“组合”的思想，Component即“组件”，一个Entity可以具有多个Component，不同Entity拥有的Component不同。每个Component都是一种数据，其不包含行为。
- System：其中存放处理数据的逻辑，用于处理每个Entity的某一个Component的更新逻辑。

举个例子：场景中有三种对象：玩家、敌人、子弹。玩家与敌人能够移动，且敌人有额外的伤害，子弹会沿直线飞行，碰到敌人后造成伤害并消失。

在ECS中，我们不把玩家、敌人、子弹做成三个类，而是把它们拆成数据（Component）和行为（System）：

- **Entity（对象）**：玩家、敌人、子弹各自对应一个Entity。
- **Component（数据）**：
  - `Position`：位置（玩家、敌人、子弹）
  - `Velocity`：速度（玩家、敌人、子弹）
  - `Health`：生命值（玩家、敌人）
  - `Damage`：伤害值（敌人、子弹）
- **System（逻辑）**：
  - `PlayerInputSystem`：读取输入，更新玩家的`Velocity`
  - `MoveSystem`：遍历所有同时拥有`Position`和`Velocity`的Entity，统一更新位置
  - `ShootSystem`：玩家开火时创建一个新Entity作为子弹，并附上`Position`、`Velocity`、`Damage`、`BulletTag`
  - `CollisionSystem`：检测子弹与敌人的碰撞，命中后减少敌人的`Health`，并销毁子弹
  - `HealthSystem`：`Health`归零时销毁对应的Entity（敌人）

简单代码示例：

```csharp
using Entity = uint32_t;

struct Position { Vec2 value; };
struct Velocity { Vec2 value; };
struct Health { Vec2 value; };
struct Attack { Vec2 value; };
struct Hit { Entity target; Vec2 damage; };

void MovementSystem(World& world,float dt)
{
    for (Entity e: world.Query<Position,Velocity>())
        world.Get<Position>(e).value += world.Get<Velocity>(e).value * dt;
}

void DamageSystem(world& world, span<const Hit> hits)
{
    for (const Hit& hit: hits)
        world.Get<Health>(hit.target).value -= hit.damage;
}

// Player: Position Velocity Health Attack
// Turret: Position Health Attack
// Bullet: Position Velocity Damage
```

### 与面向对象思想的区别

OOP主要以对象为中心，所有的数据和行为写在一个类里，即对象既是数据的容器，又是行为的执行者。比较符合人类直觉，扩展功能时较为方便（前提是得设计好架构，不然一堆史山哪个思想都不好扩展）

ECS以数据为中心，其对象的概念相较与OOP大量简化，变成了只是将一堆数据组合起来的编号。而数据和行为则独立存在。优点是批量处理大量物体非常方便，而且能够极大优化性能，缺点则是较难扩展。

当然，两者显然并非无法共存，Unity中的GameObject以及MonoBehaviour的设计本身就是一种OOP，其推出的JobSystem等则是ECS。我们在使用时需要权衡两者的利弊，例如工厂游戏的传送带物品、无人机派送等适合交给ECS，而单个玩家的输入以及UI则使用OOP。

## 为什么ECS性能更好？

简单来说，ECS的性能更好，不是因为他使用了什么更好的算法，而是因为这种架构“更符合CPU的期望”



## 在Unity中应用ECS思想

## Unity中的ECS详解

## 工厂类游戏的具体思想

## ECS又带来了哪些问题？

## 如何权衡ECS与OOP

## UE Mass