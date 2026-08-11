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
- Component：可以联系OOP中“组合”的思想，Component即“组件”，一个Entity可以具有多个Component，不同Entity拥有的Component不同。每个Component都是一个纯数据结构体，其不包含行为。
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
// Entity，实际应用时应该是一个Index+Version的结构体
using Entity = uint32_t;

// Component
// 可以看出其与OOP中组合的思想很像（或者说这就是组合）
// 当然，如果一次运行需要处理的数据较多，也可以开一个大struct，在里面存放多个属性
struct Position { Vec2 value; };
struct Velocity { Vec2 value; };
struct Health { float value; };
struct Attack { Vec2 value; };
struct Hit { Entity target; Vec2 damage; };

// 多个System
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

ECS以数据为中心，其对象的概念相较与OOP大量简化，变成了只是将一堆数据组合起来的编号。而数据和行为则独立存在。优点是批量处理大量物体非常方便，而且能够极大优化性能。缺点则是可读性没有OOP高，协作起来比较麻烦（因为规范等）。其扩展方式与OOP不同，在某些方面的功能扩展可能成本更高。

当然，两者显然并非无法共存，Unity中的GameObject以及MonoBehaviour的设计本身就是一种OOP，其推出的JobSystem等则是ECS。我们在使用时需要权衡两者的利弊，例如工厂游戏的传送带物品、无人机派送等适合交给ECS，而单个玩家的输入以及UI则使用OOP。大多数时候我们都将两者结合使用（即Unity官方所称Hybrid ECS）

## 为什么ECS性能更好？

### 数据连续存放

简单来说，ECS的性能更好，不是因为这是什么更好的算法，而是因为这种架构“更符合CPU的期望”

CPU处理数据的实际速度并不只与CPU在理想状态下处理数据的速度有关，而是需要先从内存中读取需要的数据。CPU以缓存行为单位一块一块地从内存中读取，当CPU从内存中取需要的数据时，会该数据附近的数据也一起读取进来。如果CPU进行计算时发现需要计算的东西已经一并带过来了（缓存命中），就能够直接开始计算，否则就需要重新从内存中再找一遍需要的数据并且花时间再读入CPU。对于现代CPU来说，计算速度往往不是CPU处理数据的瓶颈，而访问速度才是。

对于内存来说，OOP中的每个类都是一块单独散落在内存中的。当你对每个对象进行更新（例如MonoBehaviour调用Update）时，CPU需要先找到对象的内存，然后从内存中读取一次，当对象过多时，遍历对象列表就需要多次在内存中到处寻找，这直接导致CPU缓存命中急剧降低，每次无法实现缓存命中就必须再从内存中重新读一遍需要的内存。

而ECS则是将包含相同组件的实体Entity在内存里连续排成数组，System遍历时就只需顺序读一段内存（即for循环时指针后移），这样CPU就只需在内存中读取一遍需要处理的属性的数组，就能够获取到所有需要处理的内存，而无需每次都再重新读一遍内存。

有一个形象的例子：

- OOP：`[{Position1,Velocity1},{Position2,Velocity2},{Position3,Velocity3},{Position4,Velocity4},{Position5,Velocity5},{Position6,Velocity6}]`
- ECS：`[[Position1,Position2,Position3,Position4,Position5,Position6],[Velocity1,Velocity2,Velocity3,Velocity4,Velocity5,Velocity6]]`

这两个数组，一个是对象的数组，一个是两个属性的数组。在OOP中需要遍历每个对象并找到其Position属性，每个对象的大小可能不相同，Position在内存中的偏移可能也不相同，所以导致缓存命中低，处理速度慢。而ECS中只需在System中获取到数组，就可以直接进行批量处理了。

### 数据隔离处理

在OOP中，一个类通常拥有多个属性，而类与类之间又可能产生互相调用或者共享状态等情况。如果我希望在多核CPU上通过多线程来同时修改两个属性，为了应对数据竞争以及数据正确性，只能加锁。而加锁又会失去多核处理的优势。

而在ECS中，每个System只声明并读写它需要的那部分组件。一般在框架提供了批量操作的功能下，框架会识别依赖关系，当多个对象存在依赖时，让他们顺序执行，而当需要处理的数据独立时，框架则会将遍历切分成多段让多个线程并行执行，大大增加了性能与灵活性。

### 底层编译优化

在ECS中，我们一般将纯数字（或特殊处理过的编号用的结构）作为Entity，Component用纯数据的结构体表示，System则是纯逻辑，且System没有类那样复杂的继承、虚函数、动态内存管理等等。这使得编译器能够在编译阶段确定每个数据的类型、大小和内存布局，这允许我们在使用ECS时进行很多的内存优化。

在具体的工程实现中，这部分一般由特定的一些库实现，例如Unity中的Burst，其能够将符合条件的C#代码编译成高度优化的原生机器码。

## 在Unity中应用ECS思想

## Unity中的ECS详解

## 工厂类游戏的具体思想

## ECS又带来了哪些问题？

## 如何权衡ECS与OOP

## UE Mass