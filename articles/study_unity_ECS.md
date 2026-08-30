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
>
> [官方文档](https://docs.unity3d.com/Packages/com.unity.entities@6.5/manual/concepts-intro.html)

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

```cpp
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

除了三个核心概念之外，ECS还有许多重要的概念：

- World

自己用c++写的简单完整示例：

```cpp
#include <iostream>
#include <vector>
#include <unordered_map>
#include <memory>

using namespace std;

// 将Entity仅作为一个ID
using Entity = size_t;

// Components
struct Position
{
    float x, y;
};
struct Velocity
{
    float dx, dy;
};

class World;
class System;
class MovementSystem;

// 在ECS中，我们使用World统一管理所有实体和组件
class World
{
private:
    // 所有实体的数组
    vector<Entity> Entities;
    // 创建实体时我们需要递增id
    Entity nextID = 0;
    // 实体的Position
    unordered_map<Entity, Position> Positions;
    // 实体的Velocity
    unordered_map<Entity, Velocity> Velocities;

    // 更新时间
    float deltaTime;

    vector<unique_ptr<System>> Systems;

public:
    // 一些用于调试的打印函数
    void printEntities()
    {
        // cout << "| Entity | Position | Velocities |" << endl;
        // for (auto entity : Entities)
        // {
        //     cout << "| " << entity << " | " << Positions[entity].x << " " << Positions[entity].y << " | " << Velocities[entity].dx << " " << Velocities[entity].dy << " |" << endl;
        // }

        printPositions();
        printVelocities();
    }
    void printPosition(Entity entity, Position position) const
    {
        std::cout << "Entity " << entity << " Position : (" << position.x << ", " << position.y << ")\n";
    }
    void printVelocity(Entity entity, Velocity velocity) const
    {
        std::cout << "Entity " << entity << " Velocity : (" << velocity.dx << ", " << velocity.dy << ")\n";
    }
    void printPositions() const
    {
        for(Entity e : Entities)
        {
            auto p = Positions.find(e);
            if(p != Positions.end()) printPosition(e,p->second);
            else cout << "Entity " << e << "has no position" << endl;
        }
    }
    void printVelocities() const
    {
        for(Entity e : Entities)
        {
            auto p = Velocities.find(e);
            if(p != Velocities.end()) printVelocity(e,p->second);
            else cout << "Entity " << e << "has no velocity" << endl;
        }
    }

    // 创建新实体时递增ID来获取唯一ID
    // 这里可以换ID获取方式，可以提高ID利用率
    Entity& newEntity()
    {
        Entity id = nextID++;
        Entities.push_back(id);
        return id;
    }
    vector<Entity> getEntities()
    {
        return Entities;
    }
    
    // 对对应实体添加以及查找组件
    void addPosition(Entity entity, Position position)
    {
        Positions[entity] = position;
    }
    Position& getPosition(Entity entity)
    {
        return Positions[entity];
    }
    void addVelocity(Entity entity, Velocity velocity)
    {
        Velocities[entity] = velocity;
    }
    Velocity& getVelocity(Entity entity)
    {
        return Velocities[entity];
    }

    // 为该World添加System
    void addSystem(unique_ptr<System> system)
    {
        Systems.push_back(system);
    }
    // 获取到所有System
    vector<unique_ptr<System>>& getSystems()
    {
        return Systems;
    }

    float getDeltaTime() const
    {
        return deltaTime;
    }
};

class System
{
public:
    virtual ~System() = default;
    virtual void Update(World& world, float deltaTime) = 0;
};

class MovementSystem : public System
{ 
public:
    // 移动系统处理的移动逻辑
    void Update(World& world, float deltaTime) override
    {
        vector<Entity> entities = world.getEntities();
        for(Entity entity : entities)
        {
            Position& position = world.getPosition(entity);
            Velocity& velocity = world.getVelocity(entity);
            position.x += velocity.dx * deltaTime;
            position.y += velocity.dy * deltaTime;
        }
    }
};

int main()
{
    // 世界数组
    // 这个世界和我们常理解的世界（Scene或者Level）不同
    // 一个Scene中可以有多个World，用于分区管理
    vector<World> Worlds;

    World world1;
    world1.addSystem(make_unique<MovementSystem>());
    Worlds.emplace_back(world1);

    Entity entity1 = world1.newEntity();
    world1.addPosition(entity1, {0,0});
    world1.addVelocity(entity1, {1,1});

    bool running = true;
    // 游戏主循环
    while(running)
    {
        for(auto& world : Worlds)
        {
            for(auto& system : world.getSystems())
            {
                system->Update(world, world.getDeltaTime());
            }
        }
        
        // 给个示例
        break;
    }
}
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

基于上述种种介绍，我们很容易发现：如果要自己从头开始设计一款基于ECS设计的框架，需要懂很多相当底层的设计，例如内存分配、编译原理等等。

于是，Unity官方为了让程序员能够在引擎中方便地使用ECS并发挥其最大性能，在Unity中设计了自己的基于ECS的框架：DOTS。

### DOTS

DOTS全称为Data-Oriented Technology Stack（面向数据技术栈），其核心部分由三个相对独立的库组成：

- Unity.Entities：包含ECS框架本体，提供Entity、组件接口`IComponentData`、System、World，以及优化Component内存分布的Archetype/Chunk内存管理机制等。
- Unity.Jobs：引擎自带的多线程并行框架，Entities其之上把Entity遍历按chunk切分并行执行。
- Unity.Burst：把符合条件的C#源码编译成高度优化的原生机器码，包含在Entities包中。

其中Entities为UnityECS核心中的核心，而Burst和Jobs两个库实际上可以脱离ECS单独用在普通的MonoBehaviour上

当你安装了Entities包后，还有两个基础依赖会随其自动安装：

- Unity.Collections：NativeArray/NativeList/NativeHashMap等无GC的容器，其用于存放ECS内容
- Unity.Mathematics：提供float3/float4x4等类型以及其他工具的数学库

> [!note]
>
> 该部分及以下示例版本为6000.5.8f1

### 使用DOTS的简单示例

#### Step1 创建数据Component

在Unity里创建一个C#脚本（在Unity6中好像把"C# Script"改成了"Monobehaviour Script"，但实际上我们不用MonoBehaviour），命名为该Component的名称，把引擎创建C#脚本自动复制过来的副本删掉，然后编写你需要的数据结构：

```csharp
// ECS/DOTS的核心
using Unity.Entities;
// 使用“Mathematics”包来配合“Jobs”包功能加速计算
using Unity.Mathematics;
// 删掉不用的包
// using UnityEngine;

// 必须使用Struct
public struct MoveSpeed : IComponentData
{
    // float3是Mathematic库提供的紧凑值类型，如果是类类型的话会有内存填充浪费部分内存
    public float3 Speed;
}
```

#### Step2 创建使用这些数据的MonoBehaviour类

创建你希望使用这些Component数据的MonoBehaviour类，例如让一个Cube动起来。

我们需要在Entity世界中创建对应的Entity，并在MonoBehaviour类中记录它，便于后续通过Entity查找对应的值获取并同步。

```csharp
// 与ECS相关
using Unity.Entities;
// 包含LocalTransform
using Unity.Transforms;
using UnityEngine;

public class Cube : MonoBehaviour
{
    // 该GameObject的实体ID
    private Entity _entity;
    // 用来添加、删除等管理Entity的Manager
    private EntityManager _entityManager;

    private void Awake()
    {
        #region 初始化该对象的entity标签

        // 初始化Manager
        // DefaultGameObjectInjectionWorld是Unity启动时默认创建的默认World
        // 该World用于桥接（Injection）Entity的World和GameObject，所以GameObject才能从中拿到数据
        // 并且，该World会自动注册所有ISystem，不需要手动注册
        _entityManager = World.DefaultGameObjectInjectionWorld.EntityManager;
        _entity = _entityManager.CreateEntity();

        #endregion

        #region 挂Components
        
        // 给_entity（也就是自身）挂上MoveSpeed，初始值为0
        _entityManager.AddComponentData<MoveSpeed>(_entity, new MoveSpeed { Speed = Vector3.zero });
        // 给_entity挂上LocalTransform，初始值为物体初始位置
        _entityManager.AddComponentData<LocalTransform>(_entity, LocalTransform.FromPosition(transform.position));
        
        // 如果使用AddComponent函数，那么则少传一个初始值的参数，此时会对值进行默认初始化，例如float3 = (0,0,0)
        
        #endregion
        
        }

    private void Update()
    {
        // 从Entity世界中获取数据
        LocalTransform localTransform = _entityManager.GetComponentData<LocalTransform>(_entity);
        // 同步到MonoBehaviour的transform
        transform.position = localTransform.Position;
    }
    
}
```

写好后，将其挂到你希望其移动的GameObject上。

#### Step3 创建系统System

System用于更新Entity世界的数据，需要实现ISystem接口并推荐使用partial关键字。

关键函数为OnUpdate，每帧执行。一般在该函数中我们会用到SystemAPI去获取到该System所在的世界的内容，例如下面所写的获取到所有包含LocalTransform和MoveSpeed两个Component的Entity。

另外，还可以使用[BurstCompile]，把符合约束的C#函数编译成原生机器码。至于约束是什么后面再讲。

```csharp
using Unity.Burst;
using Unity.Entities;
using Unity.Transforms;

// partial关键字允许该类/结构体在多个文件中定义，编译时会将所有相同名称的结构体放在一起进行编译
partial struct MovementSystem : ISystem
{
    // 实现ISystem接口的函数
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        // 遍历每一个同时具有LocalTransform和MoveSpeed两个Component的entity
        // 其中Query代表查找所有同时拥有后面两个component构成的元组的entity，返回的是一个元组
        // RW代表读写，RO则代表只读，两者获取的都是数据的引用，只不过RO是只读引用
        foreach (var entity in SystemAPI.Query<RefRW<LocalTransform>, RefRO<MoveSpeed>>())
        {
            // 获取到的entity有多个Item，这里通过提取Item1并指定其为读写来更新transform
            LocalTransform localTransform = entity.Item1.ValueRW;
            // MoveSpeed则是只读的
            MoveSpeed moveSpeed = entity.Item2.ValueRO; // 这时产生副本
            // 累加速度并写回entity
            entity.Item1.ValueRW.Position = localTransform.Position + moveSpeed.Speed * SystemAPI.Time.DeltaTime;
        }
        
        // 也可以这么写（可读性更好）
        /*
        foreach (var (transform, speed) in SystemAPI.Query<RefRW<LocalTransform>, RefRO<MoveSpeed>>())
        {
            transform.ValueRW.Position += speed.ValueRO.Speed * SystemAPI.Time.DeltaTime;
        }
        */
    }
}
```

以上的都写好并放好后，可以先试试看能不能跑起来。将初始化MoveSpeed的AddComponentData的初始值改成其他值即可

也就是下面这一行

```csharp
_entityManager.AddComponentData<MoveSpeed>(_entity, new MoveSpeed { Speed = Vector3.zero });
```

改成

```csharp
_entityManager.AddComponentData<MoveSpeed>(_entity, new MoveSpeed { Speed = Vector3.one });
```

#### Step4 让方块根据输入移动

输入移动的逻辑可以写在Cube类里，也可以通过另外一个System进行控制

如果写在Cube类里，可以在Update中获取到输入的值，经过处理后使用SetComponentData更新至Entity世界：

```csharp
_entityManager.SetComponentData<MoveSpeed>(inputSpeed);
```

写作一个单独的System的话，你可以通过ValueRW直接修改值，并保留处理过程，例如添加新Component名为InputSpeed，并创建输入用的System中修改InputSpeed，再创建一个System用于在InputSpeed与MoveSpeed之间对数据进行处理。

不保留中间处理的System：

```csharp
using Unity.Entities;
using Unity.Mathematics;
using UnityEngine.InputSystem;

partial struct KeyboardInputSystem : ISystem
{
    // 这里不能加[BurstCompile]，因为Keyboard.current是托管API，Burst无法编译
    public void OnUpdate(ref SystemState state)
    {
        foreach (var entity in SystemAPI.Query<RefRW<MoveSpeed>>())
        {
            // 用于多个输入累加
            float3 inputSpeed = 0;
            // Unity推出的新输入API
            if (Keyboard.current.wKey.isPressed) inputSpeed += new float3(1f, 0f, 0f);
            if (Keyboard.current.sKey.isPressed) inputSpeed += new float3(-1f, 0f, 0f);
            if (Keyboard.current.aKey.isPressed) inputSpeed += new float3(0f, 0f, 1f);
            if (Keyboard.current.dKey.isPressed) inputSpeed += new float3(0f, 0f, -1f);
            
            // normalize在值为0时仍然会尝试除以模长0导致产生NaN，normalizesafe则在长度约等于0时返回零向量
            // 由于System每帧都会无条件的跑（除非手动加条件分支），更推荐用normalizesafe，最好养成习惯
            inputSpeed = math.normalizesafe(inputSpeed);
            entity.ValueRW.Speed = inputSpeed;
        }
    }
}
```

另外，后面会生成一堆Cube，该系统会获取到所有带MoveSpeed这个Component的entity，导致你的输入会影响到所有对象。如果你希望让每个Cube随机移动而只有特定的Cube受你的操控，可以创建一个没有数据的Component：

```csharp
public struct PlayerTag : IComponentData {}
```

该Component作为纯标签，可以通过在获取entity的Query中添加该标签作为约束，以获取所有拥有PlayerTag的entity，这样就可以限制输入的影响范围了。

除此之外，你还可以使用链式的方式来约束，例如：

```csharp
using Unity.Burst;
using Unity.Entities;
// Unity的Mathematics库的Random是一个结构体，适配Burst的编译要求
// using Random = Unity.Mathematics.Random;

partial struct InputToMovementSystem : ISystem
{
    private Random _random;

    public void OnCreate()
    {
        // 初始化随机数生成器
        _random = new Random((uint)System.DateTime.Now.Millisecond);
    }
    
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        // 与PlayerTag有关
        foreach (var (moveSpeed, inputSpeed, playerTag) in SystemAPI.Query<RefRW<MoveSpeed>, RefRO<InputSpeed>, RefRO<PlayerTag>>())
        {
            // 将InputSpeed的值同步到MoveSpeed
            moveSpeed.ValueRW.Speed = inputSpeed.ValueRO.Value;
        }
        // 我们在Spawner创建实体的时候为实体随机初始化速度，这里的随机MoveSpeed就不用了

        // WithNone<>()排除掉目标类型的实体
        // foreach (var (moveSpeed, inputSpeed) in SystemAPI.Query<RefRW<MoveSpeed>, RefRO<InputSpeed>>().WithNone<PlayerTag>())
        // {
        //     // 随机的MoveSpeed
        //     moveSpeed.ValueRW.Speed = _random.NextFloat3();
        // }
    }
}
```

#### Step5 创建并渲染大量对象

创建与渲染涉及两个核心概念：ArcheType与Entities Graphics库，分别管的是内存方向与渲染方向。我们还需要把Entities Graphics库装上。

下面我们编写CubeSpawner用于生成大量对象，为后续性能对比做准备。

```csharp
using UnityEngine;
using Unity.Entities;
using Unity.Rendering;
using Unity.Transforms;
using UnityEngine.Rendering;
using Random = Unity.Mathematics.Random;

public class CubeSpawner : MonoBehaviour
{
    [SerializeField] private int spawnCount = 10000;
    // Prefab创建是OOP思维
    // ECS有自己的批量创建实体的方法，不需要使用GameObject
    // [SerializeField] private Cube prefCube;

    private EntityManager _entityManager;
    // 组件集，用于Create带有多个组件的entity
    private EntityArchetype _entityArchetype;

    // 随机数生成
    private Random _random;
    
    // 用于渲染对象的部分
    // 每个物体都需要一个Mesh和Material，并存储至RenderMeshArray中
    // 还需要一个RenderMeshDescription决定各类渲染选项
    [SerializeField] private Mesh mesh;
    [SerializeField] private Material material;
    private RenderMeshArray _meshArray;
    private RenderMeshDescription _meshDescription;

    
    void Awake()
    {
        // 从默认World拿到Manager初始化
        _entityManager = World.DefaultGameObjectInjectionWorld.EntityManager;
        // 定义组件集合
        _entityArchetype = _entityManager.CreateArchetype(typeof(LocalTransform), typeof(MoveSpeed));
        // 初始化随机数生成器
        _random = new Random((uint)System.DateTime.Now.Ticks);
        // 初始化渲染组件
        _meshArray = new RenderMeshArray(new Material[] { material }, new Mesh[] { mesh });
        _meshDescription = new RenderMeshDescription(ShadowCastingMode.Off);
    }

    void Start()
    {
        MoveSpeed speed = new MoveSpeed();
        for (int i = 0; i < spawnCount; i++)
        {
            // 创建
            Entity entity = _entityManager.CreateEntity(_entityArchetype);
            // 设置初始值
            _entityManager.SetComponentData<LocalTransform>(entity, LocalTransform.FromPosition(_random.NextFloat3(-50f,50f)));
            speed.Speed = _random.NextFloat3(-1f, 1f);
            _entityManager.SetComponentData<MoveSpeed>(entity, speed);
            // 挂渲染组件
            // 第五个参数MaterialMeshInfo.FromRenderMeshArrayIndices(0,0)是为了显式指定使用的Mesh和Material的下标，因为源码的原因不用会报错
            RenderMeshUtility.AddComponents(entity, _entityManager, _meshDescription, _meshArray, MaterialMeshInfo.FromRenderMeshArrayIndices(0,0));
        }
    }
}
```

接下来，将CubeSpawner挂在一个场景里的空对象上，把Mesh和创建好的Material挂上去，应该就能看到场景中的物体了。

## Unity中的ECS详解



## 工厂类游戏的具体思想

## ECS又带来了哪些问题？

## 如何权衡ECS与OOP

## UE Mass