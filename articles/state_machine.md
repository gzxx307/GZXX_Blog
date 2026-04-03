# AI行为树与状态机

Tags: StateMachine, Unity

> 该文档将包含行为树中的概念以及具体实现，可能会涉及到我自己没有学到的C#中的一些语法和编程技巧等
>
> 完整内容见下：
>
> 1.【【游戏开发秘籍】状态机？行为树？一个视频速通游戏开发中的AI！#06】 https://www.bilibili.com/video/BV13EdSYgEGR/?share_source=copy_web&vd_source=517345ffbe6ab4e62fef20496d0de657
>
> 2.【【Unity搬运】如何在Unity C#中编写行为树】 https://www.bilibili.com/video/BV1D142167nS/?share_source=copy_web&vd_source=517345ffbe6ab4e62fef20496d0de657
>
> 以下所有代码仅在Rider中编辑并没有任何编译错误后直接复制上来的，不代表在unity中能够正常运行，因为仍然缺少很多模块没有实现，具体实现效果请看第二条视频

## 概述

行为树Behaviour Trees是一种树状结构，每次对AI进行状态更新时，从根节点开始先左后右依次遍历树中的内容（类似于遍历平衡树）。在该文档中，我们通过复现第二个视频中的内容（构建一个简单的AI行为树，让AI在3D世界中移动并做出巡逻、拾取宝藏、躲避等基础行为）来学习行为树的基本编写方法。
节点类型

1. **根节点（Root）**：行为树遍历的起始节点
2. **选择器（Selector）**：通过对一个状态进行判断（类似if else）选择对应的子节点
3. **序列（Sequence）**：若全部通过测试，则按顺序运行各个子节点（可以参考UE5蓝图中的Sequence节点）
4. **行为（Action/Leaf）**：树中的叶子节点，其没有子节点，表示执行该操作

### 代码构建基本方式/内容

**导入命名空间**

```
using System.Collections.Generic; //导入包含泛型集合类的命名空间
using System.Linq;                //导入LINQ（Language Integrated Query）功能
using System.Text;                //导入字符串处理相关的类
using UnityEngine;                //导入Unity游戏引擎的核心功能
```

下面是导入这些命名空间后可以使用的内容

#### System.Collections.Generic

```csharp
List<string> names = new List<string>();    // 列表
Dictionary<int, string> dict = new Dictionary<int, string>();  // 字典
Queue<int> queue = new Queue<int>();        // 队列
Stack<int> stack = new Stack<int>();        // 栈
```

#### System.Linq

```csharp
var numbers = new List<int> { 1, 2, 3, 4, 5 };
var evenNumbers = numbers.Where(n => n % 2 == 0);  // 查询操作
var sum = numbers.Sum();                           // 聚合操作
var sorted = numbers.OrderBy(n => n);              // 排序操作
```

#### System.Text

```csharp
StringBuilder sb = new StringBuilder();
sb.Append("Hello");
sb.Append(" World");
string result = sb.ToString();  // "Hello World"
```

这些命名空间的具体内容以及使用场景待学习

### 构建命名空间 StudyBehaviourTrees

命名空间的命名标准为当前文件所在的文件夹的名称，如果有多级文件夹，则使用“.”来为命名空间分级

如：

```csharp
namespace Study.StudyBehaviourTrees{}
// 等价于
namespace Study{namespace StudyBehaviourTrees{}}
```

## 策略接口 IStrategy

```csharp
public interface IStrategy
{
    Node.Status Process();
    void Reset();
}
```

策略接口的具体实现将在真正构建行为树时进行，此处仅为大致结构的介绍

## 节点基类 Node

该基类节点应该包含所有子节点的通用功能，包括节点所属的状态、节点名、该节点下的子节点、当前运行到的子节点、添加子节点、返回子节点的状态、重置该节点以及所有子节点的功能

```csharp
//基类节点Node
public class Node
{
    public enum Status { Success, Failure, Running } //类内状态枚举（行动成功，行动失败，正在行动）

    public readonly string name; //节点名
    public readonly List<Node> children = new(); //初始化子节点
    protected int currentChild;

    public Node(string name = "Node")
    {
        this.name = name;
    }
    public void AddChild(Node child) => children.Add(child);
    public virtual Status Process() => children[currentChild].Process();
    public virtual void Reset() //重置索引
    {
        currentChild = 0;
        foreach (var child in children)
        {
            child.Reset(); //也调用所有的子节点的Reset
        }
    }
}
```

`readonly` 关键字即只读，只读变量只能在声明时或构造函数中被赋值，之后就不能再修改了

**作用：**
1. 保证数据不可变性
2. 线程安全，多个线程可以安全读取该变量，无需锁
3. 提高代码可读性

**与 const 的区别：**

| 字段 | 赋值时机         | 内存位置   | 类型限制           | 性能           |
|------|------------------|------------|--------------------|----------------|
|readonly| 运行时（构造函数） | 实例存储   | 任何类型           | 正常字段访问   |
|const   | 编译时           | 静态存储   | 基本类型、string、null | 编译时常量替换 |

类似 AddChild 和 Process 这样调用了子节点相同名称的函数，通过循环调用下一级的函数的方式实现向下递归，即最后该节点的 AddChild 函数将在该节点所拥有的子节点中最下方的非叶子节点处添加节点；而 Process 则返回该节点最下方叶子节点的运行状态

---

## 叶子节点类 Leaf

这个节点应该是最好写的节点，即只需要执行命令即可

```csharp
//叶节点
public class Leaf : Node
{
    readonly IStrategy strategy;

    public Leaf(string name, IStrategy strategy) : base(name)
    {
        this.strategy = strategy;
    }
    public override Status Process()  => strategy.Process();
    public override void Reset() => strategy.Reset();
}
```

---

## 行为树根节点 BehaviourTree

```csharp
public class BehaviourTree : Node
{
    public BehaviourTree(string name) : base(name) { }

    public override Status Process()
    {
        while (currentChild < children.Count)
        {
            var status = children[currentChild].Process();
            if (status != Status.Success)
            {
                return status;
            }
            currentChild++;
        }
        return Status.Success;
    }
}
```

这里的 Process 的返回值代表该行为树整体的状态是否是 Success

以上是构成一个行为树最基本的要素，根节点代表行为树的入口，叶子节点代表行为树具体的执行内容

---

## 序列节点 Sequence

可以理解为逻辑与的关系，只有以下的子节点全为 Success 才为 Success，并继续执行以下的子节点

```csharp
public class Sequence : Node
{
    public Sequence(string name) : base(name) { }

    public override Status Process()
    {
        if (currentChild < children.Count)
        {
            var status = children[currentChild].Process();
            switch (status)
            {
                case Status.Running:
                    return Status.Running;
                case Status.Failure:
                    return Status.Failure;
                default:
                    currentChild++;
                    return currentChild < children.Count ? Status.Success : Status.Running;
            }
        }
        Reset();
        return Status.Success;
    }
}
```

---

## 选择器节点 Selector

与 Sequence 节点相似，但该节点可以理解为逻辑或的关系，只要下方的子节点中有一个节点返回 Success 则为 Success，并执行该子节点的内容

```csharp
public class Selector : Node
{
    public Selector(string name) : base(name) { }

    public override Status Process()
    {
        if (currentChild < children.Count)
        {
            var status = children[currentChild].Process();
            switch (status)
            {
                case Status.Running:
                    return Status.Running;
                case Status.Success:
                    return Status.Success;
                default:
                    currentChild++;
                    return Status.Running;
            }
        }
        Reset();
        return Status.Failure;
    }
}
```

---

## 带有优先级的选择器节点 PrioritySelector

### 修改 Node 基类的内容

我们为 Node 添加属性 priority 代表该节点的优先级，以便 PrioritySelector 类对节点排序

```csharp
public class Node
{
    public enum Status { Success, Failure, Running } //类内状态枚举（行动成功，行动失败，正在行动）

    public readonly string name; //节点名
    public readonly int priority;
    public readonly List<Node> children = new(); //初始化子节点
    protected int currentChild;

    public Node(string name = "Node", int priority = 0)
    {
        this.name = name;
        this.priority = priority;
    }
    public void AddChild(Node child) => children.Add(child);
    public virtual Status Process() => children[currentChild].Process();
    public virtual void Reset() //重置索引
    {
        currentChild = 0;
        foreach (var child in children)
        {
            child.Reset(); //也调用所有的子节点的Reset
        }
    }
}
```

看到这，你可能需要为上面所有已编写的节点类的构造函数添加一个入参 priority，以统一所有节点

### 具体实现

```csharp
public class PrioritySelector : Selector
{
    private List<Node> sortedChildren;
    private List<Node> SortedChildren => sortedChildren ??= SortedChildren;
    protected virtual List<Node> SortChildren() => children.OrderByDescending(child => child.priority).ToList();
    public PrioritySelector(string name) : base(name) { }
    public override void Reset()
    {
        base.Reset();
        sortedChildren = null;
    }
    //与Selector相同
    public override Status Process()
    {
        if (currentChild < children.Count)
        {
            var status = children[currentChild].Process();
            switch (status)
            {
                case Status.Running:
                    return Status.Running;
                case Status.Success:
                    return Status.Success;
                default:
                    currentChild++;
                    return Status.Running;
            }
        }
        return Status.Failure;
    }
}
```

## 其他节点

### 随机选择器 RandomSelector

```csharp
public class RandomSelector : PrioritySelector
{
    protected override List<Node> SortChildren() => Shuffle(children).ToList();
    public RandomSelector(string name, int priority = 0) : base(name, priority) { }
    private static Random rng = new Random();
    private List<Node> Shuffle(List<Node> children)
    {
        int n = children.Count;
        while (n > 1)
        {
            n--;
            int k = rng.Next(n + 1);
            (children[k], children[n]) = (children[n], children[k]);
        }
        return children;
    }
}
```

这里面我自己写了一个打乱数组的方法，因为没试过不知道能不能用

### 逆变器 Inverter

可以理解为逻辑非

```csharp
public class Inverter : Node
{
    public Inverter(string name) : base(name) { }
    public override Status Process()
    {
        switch (children[0].Process())
        {
            case Status.Running:
                return Status.Running;
            case Status.Success:
                return Status.Failure;
            default:
                return Status.Success;
        }
    }
}
```

### 持续运行 UntilFail

一直运行的节点，不会返回 Success，如果正常运行，该节点将保持 Running 并持续运行，如果运行失败，则 Reset 并返回 Failure

```csharp
public class UntilFail : Node
{
    public UntilFail(string name) : base(name) { }
    public override Status Process()
    {
        if (children[0].Process() == Status.Failure)
        {
            Reset();
            return Status.Failure;
        }
        return Status.Running;
    }
}
```

---

# AI行为树具体实现示例

下面我们将以一个简单的AI行动树为例，展现行动树如何具体实现

## 实现巡逻类

```csharp
public class PatrolStrategy : IStrategy
{
    private readonly Transform entity;//参考实体
    private readonly NavMeshAgent agent;//导航代理
    private readonly List<Transform> patrolPoints;//需要巡逻的地点列表（检查点）
    private readonly float patrolSpeed;//巡逻速度
    private int currentIndex;//保留导航点的索引
    private bool isPathCalculated;//代理是否真的在计算路径

    public PatrolStrategy(Transform entity, NavMeshAgent agent, List<Transform> patrolPoints, float patrolSpeed = 2f)
    {
        this.entity = entity;
        this.agent = agent;
        this.patrolPoints = patrolPoints;
        this.patrolSpeed = patrolSpeed;
    }

    public Node.Status Process()
    {
        if (currentIndex >= patrolPoints.Count) return Node.Status.Success;
        var target = patrolPoints[currentIndex];
        agent.SetDestination(target.position);
        entity.LookAt(target);
        if (isPathCalculated && agent.remainingDistance <= 0.1f)
        {
            currentIndex++;
            isPathCalculated = false;
        }
        if(agent.pathPending) isPathCalculated = true;
        return Node.Status.Running;
    }
    public void Reset() => currentIndex = 0;
}
```

该 Strategy 实现了一个巡逻的逻辑，检查AI是否已经遍历完所有的检查点，如果检查点全部遍历完则返回 Success，Reset 则用于重置巡逻状态，实现AI循环巡逻

> TODO：介绍主要功能，实现了什么逻辑，如何与上述代码产生联动，还有更深层次的了解 UnityEngine.AI 命名空间的内容（可能需要另外开文档）

---

## 实现仅含叶子节点的行为树的 Hero 类

```csharp
[RequireComponent(typeof(NavMeshAgent))]
//[RequireComponent(typeof(HeroAnimationController))]
//动画组件，未复现
public class Hero : MonoBehaviour
{
    //[SerializeField] private InputReader input;
    //InputReader应该是教程之前自定义的类，未实现
    [SerializeField] private List<Transform> wayPoints = new();
    NavMeshAgent agent;
    //AnimationController animations;
    BehaviourTree tree;
    void Awake()
    {
        agent = GetComponent<NavMeshAgent>();
        //animations = GetComponent<AnimationController>();
        tree = new BehaviourTree("Hero");
        tree.AddChild(new Leaf("Patrol", new PatrolStrategy(transform,agent,wayPoints)));
    }
    void OnEnable()
    {
        //input.EnablePlayerActions();
        //input.Click += OnClick;
    }
    void OnDisable()
    {
        //input.Click -= OnClick;
    }
    void Update()
    {
        //animations.SetSpeed(agent.velocity.magnitude);
        tree.Process();
    }
    void OnClick(RaycastHit hit)
    {
        if (NavMesh.SamplePosition(hit.point, out NavMeshHit hitNavMesh, 1.0f, NavMesh.AllAreas))
        {
            agent.SetDestination(hitNavMesh.position);
        }
    }
}
```

简单来说就是实现了对象在一个房间中遍历多个检查点的效果，由于没有实现循环且根节点即叶子节点，该对象仅会巡逻一次且仅有巡逻行为

## 使用 Sequence 实现条件执行

下面我们制作一个拾取宝藏的功能，来更好的讲解 Sequence 的原理以及如何实现

### 实现状态类 Condition

该类用于评估某值（视频中用“恐惧值”举例）是否超过阈值，可以理解为行为树中的一个自定义的 if 语句，由于 Sequence 的运行要求所有以下的节点都通过，Condition 能够控制或检测 Sequence 能否正常运行

在实现该接口时，我们使用了额外的命名空间 System 以使用 Func<> 模板

```csharp
public class Condition : IStrategy
{
    readonly Func<bool> predicate;
    public Condition(Func<bool> predicate) => this.predicate = predicate;
    public Node.Status Process() => predicate() ? Node.Status.Success : Node.Status.Failure;
    public void Reset() { }
}
```

该处代码相当简单，因此我们不需要重写 IStrategy 中的 Reset，因此直接让他的函数体为空即可

### 实现行动类 ActionStrategy

```csharp
public class ActionStrategy : IStrategy
{
    private readonly Action doSomething;
    public ActionStrategy(Action doSomething) => this.doSomething = doSomething;
    public Node.Status Process()
    {
        doSomething();
        return Node.Status.Success;
    }
    public void Reset() { }
}
```

### 寻宝行为实现

新增私有变量

```csharp
[SerializeField] private GameObject treasure;
```

更改 Awake 函数对行为树的初始化（暂时取消巡逻逻辑）

```csharp
void Awake()
{
    agent = GetComponent<NavMeshAgent>();
    //animations = GetComponent<AnimationController>();
    tree = new BehaviourTree("Hero");
    //tree.AddChild(new Leaf("Patrol", new PatrolStrategy(transform,agent,wayPoints)));
    Leaf isTreasurePresent = new Leaf("isTreasurePresent", new Condition(() => treasure.activeSelf));
    Leaf moveToTreasure = new Leaf("moveToTreasure", new ActionStrategy(() => agent.SetDestination(treasure.transform.position)));
    Sequence goToTreasure = new Sequence("goToTreasure");
    goToTreasure.AddChild(isTreasurePresent);
    goToTreasure.AddChild(moveToTreasure);
    tree.AddChild(goToTreasure);
}
```

当 treasure 对象为已启用时，对象将朝 treasure 方向移动，而如果 treasure 对象未启用则无法执行 Sequence 中的所有行为

## 使用 Selector 实现执行任务

再添加一个 treasure 并修改 Awake 中的内容

```csharp
void Awake()
{
    agent = GetComponent<NavMeshAgent>();
    //animations = GetComponent<AnimationController>();
    tree = new BehaviourTree("Hero");
    //tree.AddChild(new Leaf("Patrol", new PatrolStrategy(transform,agent,wayPoints)));
    Leaf isTreasurePresent = new Leaf("isTreasurePresent", new Condition(() => treasure.activeSelf));
    Leaf moveToTreasure = new Leaf("moveToTreasure", new ActionStrategy(() => agent.SetDestination(treasure.transform.position)));
    Sequence goToTreasure = new Sequence("goToTreasure");
    goToTreasure.AddChild(isTreasurePresent);
    goToTreasure.AddChild(moveToTreasure);
    Leaf isTreasurePresent2 = new Leaf("isTreasurePresent2", new Condition(() => treasure2.activeSelf));
    Leaf moveToTreasure2 = new Leaf("moveToTreasure2", new ActionStrategy(() => agent.SetDestination(treasure.transform.position)));
    Sequence goToTreasure2 = new Sequence("goToTreasure2");
    goToTreasure2.AddChild(isTreasurePresent2);
    goToTreasure2.AddChild(moveToTreasure2);
    Selector goToTreasures = new Selector("goToTreasures");
    goToTreasures.AddChild(goToTreasure);
    goToTreasures.AddChild(goToTreasure2);
    tree.AddChild(goToTreasures);
}
```

根据这段代码，当 Treasure 和 Treasure2 同时启用时，角色会向 Treasure 移动，因为 Treasure 先被加入到树中，索引在 Treasure2 前面

要使用 PrioritySelector，只需要将使用的类改为 PrioritySelector，并且为子节点（如上面的 Sequence goToTreasure 节点）传入优先级即可，这里不再赘述

## 最终实现

最终编写出来的代码实现了包括巡逻、躲避到安全位置、追踪并拾起宝藏的功能

首先，我们在 BehaviourTree 中 Process 函数的 return Status.Success 前添加令 currentChild = 0，这样在整个行为树遍历完成后的下次运行时，函数将再次进入 while，实现行为树的循环

```csharp
public override Status Process()
{
    while (currentChild < children.Count)
    {
        var status = children[currentChild].Process();
        if (status != Status.Success)
        {
            return status;
        }
        currentChild++;
    }
    currentChild = 0;
    return Status.Success;
}
```

### 最后是完整的 Hero 类

```csharp
[RequireComponent(typeof(NavMeshAgent))]
//[RequireComponent(typeof(HeroAnimationController))]
//动画组件，未复现
public class Hero : MonoBehaviour
{
    //[SerializeField] private InputReader input;
    //InputReader应该是教程之前自定义的类，未实现
    [SerializeField] private List<Transform> wayPoints = new();
    [SerializeField] private GameObject treasure;
    [SerializeField] private GameObject treasure2;
    NavMeshAgent agent;
    //AnimationController animations;
    BehaviourTree tree;
    public bool inDanger;
    [SerializeField] private GameObject safeSpot;
    void Awake()
    {
        agent = GetComponent<NavMeshAgent>();
        //animations = GetComponent<AnimationController>();
        tree = new BehaviourTree("Hero");
        PrioritySelector actions = new PrioritySelector("AgentLogic");
        Sequence runToSafety = new Sequence("RunToSafety",100);
        bool IsSafe()
        {
            if (!inDanger)
            {
                runToSafety.Reset();
                return false;
            }
            return true;
        }
        runToSafety.AddChild(new Leaf("isSafe", new Condition(IsSafe)));
        runToSafety.AddChild(new Leaf("GotoSafety", new MoveToTarget(transform, agent, safeSpot.transform)));
        actions.AddChild(runToSafety);
        Selector goToTreasures = new Selector("GotoTreasures", 50);
        Sequence getTreasure1 = new Sequence("GetTreasure1");
        Sequence getTreasure2 = new Sequence("GetTreasure2");
        getTreasure1.AddChild(new Leaf("isTreasure1", new Condition(() => treasure.activeSelf)));
        getTreasure1.AddChild(new Leaf("GotoTreasure1", new MoveToTarget(transform, agent, treasure.transform)));
        getTreasure1.AddChild(new Leaf("PickUpTreasure1", new ActionStrategy(() => treasure.SetActive(false))));
        getTreasure2.AddChild(new Leaf("isTreasure2", new Condition(() => treasure2.activeSelf)));
        getTreasure1.AddChild(new Leaf("GotoTreasure2", new MoveToTarget(transform, agent, treasure2.transform)));
        getTreasure1.AddChild(new Leaf("PickUpTreasure2", new ActionStrategy(() => treasure2.SetActive(false))));
        goToTreasures.AddChild(getTreasure1);
        goToTreasures.AddChild(getTreasure2);
        actions.AddChild(goToTreasures);
        Leaf patrol = new Leaf("Patrol", new PatrolStrategy(transform, agent, wayPoints));
        actions.AddChild(patrol);
    }
    void OnEnable()
    {
        //input.EnablePlayerActions();
        //input.Click += OnClick;
    }
    void OnDisable()
    {
        //input.Click -= OnClick;
    }
    void Update()
    {
        //animations.SetSpeed(agent.velocity.magnitude);
        tree.Process();
    }
    void OnClick(RaycastHit hit)
    {
        if (NavMesh.SamplePosition(hit.point, out NavMeshHit hitNavMesh, 1.0f, NavMesh.AllAreas))
        {
            agent.SetDestination(hitNavMesh.position);
        }
    }
}
```