# UE中的GAS系统

Tags: UE, 经验, 知识

GAS，全程为Gameplay Ability System

GAS系统最初是为堡垒之夜设计的，之后被收录为UE主体的框架

他这么做一定有他的道理，而且身边学UE的senpai们都说GAS是走UE这条路必须学会的技能，可以体会到这个系统他有多强了 ~~！？强强？！~~

但是到底有多强？~~籽岷音（~~下面是我学习GAS的一些心得，包括这套系统的教学，有什么收获，以及自己的一些想法和自己的代码层面上的扩展和进一步封装

> 本文基于UE5.7，每个UE版本的代码可能都会不太一样，但是框架应该大差不差

> 参考文章或文献：
> 
> [https://github.com/BillEliot/GASDocumentation_Chinese](https://github.com/BillEliot/GASDocumentation_Chinese)（一个为UE4写的笔记，已经四年没更新了，可以看看作为参考，如果想看UE5的GAS，可以看[https://github.com/tranek/GASDocumentation](https://github.com/tranek/GASDocumentation)，可惜这是英文版的，而且也很久没更新了）
>
> [官方文档](https://dev.epicgames.com/documentation/unreal-engine/gameplay-ability-system-for-unreal-engine)

## 为什么选择GAS

为了在游戏开发的过程中能够清晰方便的管理角色的技能、效果、判定、属性等等的内容，如果我们没有一套明文清晰的框架，代码写到后面就只会变成依托答辩。在Unity中，Unity官方并没有提供这样一套系统，官方层面上是完全空白的，如果你希望有一套自己的技能框架，则需要自己写，而第三方库的方案就比较零散，没有一个统一的标准，导致每次都需要接受一套新的规则。但是UE官方则主动将这样一套系统开放（特别是源码开源，伟大的开源精神这一块）

简单来说，涉及到各种各样的系统，例如网络同步和UE本身的Gameplay Framwork，GAS都有非常好的适配和集成，还有代码和框架上的设计，看起来就非常清晰，所以GAS现在已经是各个UE游戏开发厂商普遍认可的框架了，而且得到了广泛认可

虽然GAS的学习曲线陡峭（就如同UE本身一样），但是只要学完了，就能够收获一套结构清晰的底层框架，甚至是构建底层框架的思维，这无疑对你（也是对我，写这段话的时候我只是浅浅了解了该框架，但还没有真正深刻系统的学习）有莫大的帮助

## GAS框架的主要概念

GAS框架主要以以下几个组件或者类组成：

- ASC（Ability System Component）主要组件，负责管理所有的技能
- Tag（FGameplayTag）游戏标签，GAS下的所有行为都基于标签，包括但不限于触发Trigger，天赋互斥或取消
- GA（Gameplay Abilities）角色的技能，比如肉鸽里的一个天赋，或是角色的一次主动攻击
- AS（Attribute Set）角色身上用float表示的属性，如生命值、体力值、魔力值等，AS内的一个属性值分为基础值和当前值
- GE（Gameplay Effects）主要用于修改属性，如增加50移动速度10s，也可以激活其他GA、GE或Tag
- GC（Gameplay Cues）用于表现上的内容，比如特效，音效等

概括他们的关系如下所述，主要是为了先构建一个整体，对框架的内容有一个大致的了解：

- ASC是核心，所有东西都在ASC身上或通过ASC处理：
  - ASC必须挂载一个Actor上
  - GA由ASC授予给一个对象
  - AS需要注册到对象的ASC
  - GE通过ASC应用到自身或目标
  - GC通过ASC转发给UGameplayCueManager处理
- Tag是各个组件之间相互沟通的标志：
  - 判定GA的激活/取消
  - 判定GE的生效/免疫
  > 这意味着可以在DataAsset上面配置和定义标签，类似写mc的mod里用到的语言表，不需要会写代码，而且写代码反而把字符串硬编码在代码里，查看和维护起来会非常麻烦
  > 
  > ```
  > "hint.show_your_keys.sneak":       "蹲下",
  > "hint.show_your_keys.stand_up":    "起身",
  > "hint.show_your_keys.sprint":      "疾跑",
  > "hint.show_your_keys.sprint_swim": "疾游",
  > "hint.show_your_keys.drop_item":   "丢出物品",
  > ```
- GA不能自己独立存在，只能先在文件里创建，在运行时通过ASC授予，触发也需要通过ASC来释放。释放后应用Cost和Cooldown两个GE（将释放技能的消耗和冷却看作更改AS，那么Cost和Cooldown本身就可以被设计为GE）
- AS可以看作角色的属性，当然这里的属性可以是非常广义的，角色的技能冷却、特殊能力等等都可以看作Attribute的一部分
- GE由GA触发，自定义如何对AS进行修改
- GC则是一整套处理下来最终对外展现的视觉或听觉效果

例如玩家希望发射一个火球，那么流程为：

玩家按键

->ASC::TryActivateAbilityByTag(FireballTag)

->有没有该Tag？没有就拒绝

->GA::Activate()开始

->GA::CommitAbility()（未重载的ActivateAbility事件会自动调用该函数）根据配置的Cost GE和Cooldown GE扣蓝扣血

->GA::ApplyGameplayEffectToTarget(TargetASC, Damage_GE)对目标ASC应用GE，修改目标AS并广播

->GA::TriggerGameplayCue(ExplosionCueTag)交由GameplayCueManager播放爆炸特效和音效

->GA::EndAbility结束

### Ability System Component

Ability System Component是整个GAS的基础组件，相当于原先的整个Gameplay系统进入GAS的入口。Actor挂在ASC后就可以使用GAS相关的函数及其背后的系统

ASC本质是一个UActorComponent，必须挂在Actor上才能工作，用于处理整个框架下的交互逻辑，包括使用技能（GameplayAbility）、包含属性（AttributeSet）、处理各种效果（GameplayEffect）

拥有ASC的Actor被称为ASC的OwnActor，ASC实际作用的Actor叫做TargetActor（UE早期版本叫AvatarActor）。ASC可以被赋予某个Pawn，也可以被赋予PlayerState（保存在PlayerState里能够保存死亡角色的数据，因为角色死亡与复活涉及控制Pawn的转移，保存在PlayerState中保证客户端一人一个，不会丢失）

### Gameplay Tag

GameplayTag可以理解为有层级的字符串（例如写C++代码时使用的显示种类的属性），通过层级关系构建起一个树状结构

其本质是FGameplayTag，是由GameplayTagManager注册的形似Parent.Child.Grandchild...的层级Name，例如某个Character处于眩晕状态，我们可以给一个State.Debuff.Stun的GameplayTag

GAS系统以GameplayTag为标志运行，几乎所有操作都支持以Tag触发或以Tag拒绝（比如免疫效果），系统通过GameplayTag代替了其他Bool判断或其他方式的Trigger触发

> 由于GAS系统需要大量使用Tag，在添加Tag标签时一定要注意添加的Tag标签的结构，最好在一开始涉及的时候就确定好层级结构，以免造成Tag标签的混乱

### Attribute Set

在介绍AttributeSet前，我们需要先介绍Attribute

每个Attribute不是裸float，而是一个FGameplayAttributeData，其包含两个值：基础值（BaseValue）和当前值（CurrentValue）。例如HP的Base Value为100，获得一个Buff（GameplayEffect）提升10点HP，那么修改的应该是Current Value，此时Current Value为110

FGameplayAttribute则是一个属性标识符，内部持有一个FProperty*指向UAttributeSet中具体的一个属性字段

AttributeSet负责定义和持有属性，并且管理属性的变化。需要在Actor中被添加为成员变量，并注册到ASC（C++），所有AttributeSet相关的所有修改都需要通过C++修改

一个ASC可以拥有一个或多个不同的AttributeSet，因此你可以让角色从初始开始就有一个很大的AttributeSet，也可以按需添加和删除AttributeSet（但在运行时移除AS是危险的）

AttributeSet的修改需要通过GameplayEffects间接修改

AttributeSet有一整套完整的生命周期函数，类似Unity的一个Script的生命周期，其允许你在生命周期中的各个阶段插入逻辑：

- PreGameplayEffectExecute：在GE执行计算前执行，一般用于条件拦截，该函数返回bool值，如果返回false则代表GE不生效
- PostGameplayEffectExecute：在GE执行后，一般用于伤害后处理（例如角色死亡）
- PreAttributeBaseChange：BaseValue被修改前，可用于做Clamp（比如钳制HP不能低于0或大于某一最大值）
- PreAttributeChange：在任何属性值被修改前，与上面一样
- PostAttributeBaseChange：BaseValue被修改后
- PostAttributeChange：任何属性值被修改后

创建一个AttributeSet类，需要使用AbilitySystemComponent.h以及ATTRIBUTE_ACCESSORS_BASIC()宏

```cpp
UCLASS()
class UMyAttributeSet : public UAttributeSet
{
    GENERATED_BODY()
public:
    UPROPERTY(BlueprintReadOnly)
    FGameplayAttributeData Health;
    ATTRIBUTE_ACCESSORS_BASIC(UMyAttributeSet, Health)
    // 该宏会自动生成GetHealthAttribute(),GetHealth(),SetHealth(),InitHealth()四个函数，作为该属性的getter和setter
};
```

### Gameplay Ability

Gameplay Ability定义了一个对象（Actor）可以做的行为或技能，能力可以是普通攻击或者吟唱技能，可以是角色被击飞倒地，还可以是使用某种道具，交互某个物件，甚至跳跃、飞行等角色行为，只要是角色做出的行为都可以成为Ability

Ability可以被赋予对象或从对象的ASC中移除，对象同时可以激活多个GameplayAbility

**角色需要拥有GA，才能使用GA**

给角色添加GA使用AbilitySystemComponent提供的GiveAbility函数（或者节点），指定一个Ability Class添加

释放GA的方式则有两种，一种是根据类直接触发，一种则是通过Tag触发（这样会激活所有该Tag的GA）

GA的启用分为实例化和释放两个过程，前者主要是生成一个FGameplayAbilitySpec对象，并为一部分非公有（非静态）属性赋值，如当前GA的等级。后者操作的实际对象则为Spec

GA的实例化策略决定了当GameplayAbility激活时是否和如何实例化，具体有三种实例化策略：

|实例化策略|描述|例子|
|---|---|---|
|按Actor实例化(Instanced Per Actor)|每个ASC只能有一个在激活之前复用的GameplayAbility实例|这可能是你使用最频繁的实例化策略. 你可以对任一Ability使用并在激活之间提供持久化. 设计者可以在激活之间手动重设任意变量|
|按操作实例化(Instanced Per Execution)|每有一个GameplayAbility激活，就有一个新的GameplayAbility实例创建|这些GameplayAbility的好处是每次激活时变量都会重置，其性能要比Instanced Per Actor差，因为每次激活时都会生成新的GameplayAbility|
|非实例化(Non-Instanced)|GameplayAbility操作其ClassDefaultObject，没有实例创建|它是三种方式中性能最好的，但是使用它是最受限制的。非实例化(Non-Instanced)GameplayAbility不能存储状态，这意味着没有动态变量和不能绑定到AbilityTask委托。使用它的最佳场景就是需要频繁使用的简单Ability, 像MOBA或RTS游戏中小兵的基础攻击。如果在非实例化中创建变量并修改，那么改变量会应用的所有的该GA上，并且重开游戏还能读取到该变量|

### Ability Task

GameplayAbility只能在一帧中开始执行，也就是说其触发是瞬时的，对于那些需要进行吟唱或前摇的技能，GameplayAbility并不能提供太多的灵活性，为了为了实现随时间推移而触发或响应一段时间后触发的委托操作，我们需要使用AbilityTask

AbilityTask本质上是一个异步操作，调用PlayMontageAndWait函数返回一个AsyncTask，如果想要手动取消该AbilityTask，则直接调用Task的成员函数EndTask即可

GAS系统自带了许多AbilityTask，详情参考UE文档。如果需要自己写AbilityTask，则需要使用C++

> UAbilityTask的构造函数中硬编码了其最多允许1000个AbilityTask同时运行，设计那些同时拥有数百个Character的游戏的GameplayAbility时要注意这一点

### Gameplay Effect

GameplayEffect是GameplayAbility对自己或他人产生影响的途径，GameplayAbility通过施加GameplayEffect来修改AttributeSet

其中包含例如游戏中的Buff，提供增益/减益效果，或者更广义的，伤害结算、施加控制、霸体效果都可以通过GameplayEffect实现

**Gameplay Effect是修改Attribute的唯一途径**

下面是使用GameplayEffect会涉及到的几个类

#### UGameplayEffect

UGameplayEffect相当于一个可配置的数据表，但不在其中配置具体的数值，而是配置与GameplayEffect相关的一些模式

**如何使用UGameplayEffect**

首先，其仅起到一个配置的作用，一般的蓝图类的生命周期函数在该类中均为虚函数，这意味着你无法继承其生命周期函数。UE这么设计是因为其不希望用户在图标中写入逻辑。所以通常不在继承了UGameplayEffect的蓝图类中写入逻辑。

> 源码中写道"This is only blueprintable to allow for templating gameplay effects. Gameplay effects should NOT contain blueprint graphs."

另外，UGameplayEffect一般也无需在C++中进行继承

要使用UGameplayEffect，首先创建继承自UGameplayEffect的蓝图类，并在该类中配置你期望的内容

在类默认值中，你可以设置：

##### 持续时间

设置该GE的持续时间，分为实时（瞬间作用）、无限（无限时长）、拥有持续时间。

"无限"和"拥有持续时间"还包含一个属性："周期"。其表示一个Modifier触发的计时器，例如周期为5时Modifier每5秒触发一次。而当周期为0时，Modifier只触发一次（Modifier下面讲）

"拥有持续时间"有其"持续时间"和"最大持续时间"，幅度计算类型表示的时该数值的计算方式：

1. 可扩展浮点：数值为硬编码浮点数，且该浮点数可以通过曲线来修改。例如定义该效果为回复HP50点，其对应曲线上的一个点，当角色技能升级时，曲线x轴右移，那么该效果回复的HP会更多（相当于映射的作用）。
2. 属性基础：基于某个属性计算数值。计算公式为：
   $$
    (Coefficient × (PreMultiplyAdditiveValue + 属性值)) + PostMultiplyAdditive
   $$
   - "支持属性"指的是公式中"属性值"的来源，选择某一Attribute以及Attribute的值是来源于施加GameplayEffect的对象还是被施加的对象。
   - "属性曲线"即取到属性值后进行映射覆盖原属性。"属性计算类型"分为三个：
     1. 属性幅度：以该属性的最终值作为支持属性
     2. 属性基值：以该属性的基础值作为支持属性
     3. 属性加成幅度：相当于FinalValue-BaseValue
3. 自定义计算类：使用自定义的计算方式计算值（用到的是"计算类"，后面讲）。但UE还保留了"预乘加值"和"后乘加值"。其公式为：
   $$
    (Coefficient × (PreMultiplyAdditiveValue + 计算类输出)) + PostMultiplyAdditive
   $$
   然后再根据曲线进行映射得出最终值
4. 由调用者设置：调用前先设定，然后再进行调用。

##### 组件

组件为GE提供除数值以外的其他功能，例如为Actor赋予或移除标签、在此效果后额外附加效果、移除其他效果、赋予能力等

##### 修饰符

修饰符为GE提供数值相关的功能，例如修改被施加GE者的Attribute

其中修改器操作有六种：

1. 添加（基础）：多个AddBase先求和，然后与BaseValue相加
2. 乘法（加法）：多个MultiplyAdditive先求和，然后乘到上一步结果上
   > 注意：编辑器中填入的数值应为期望添加的百分比+1，例如希望攻击力加50%，那么填入1.5，两个1.5等价为2.0（即50%+50%=100%）
3. 除法（加法）：多个DivideAdditive先求和，然后除到上一步结果上
   > 注意：多个Divide叠加的最终结果为求和后-1，例如希望攻击力减50%，则填入2.0，两个2.0等价为3.0（即2.0+2.0-1=3.0）
4. 乘法（复合）：多个MultiplyCompound先求乘积，然后再乘到上一步结果上，例如暴击*属性克制
5. 添加（最终）：多个AddFinal先求和，然后加到上面的步骤的最终结果上
6. 重载：不理任何前置公式1，直接将最终值改成指定值，例如无敌状态将伤害改为0

最终公式为（同级同类值先聚合，再代入公式）：

$$
((BaseValue + AddBase) * MultiplyAdditive / DivideAdditive * MultiplyCompound) + AddFinal
$$

##### 执行

执行是一个额外的脚本，定位为该GE生效时执行的一次性的复杂脚本，可以在该脚本中完全自定义C++/蓝图计算

条件GE指的是在Execution执行成功后对同一目标应用的GE

#### UGameplayEffectExecutionCalculation

即上文中提到的"计算类"，其捕获Attribute，执行计算逻辑，最后返回处理后的值

> 现阶段的该类似乎几乎没有为蓝图暴露函数，导致该类定义的工具函数、Execution函数的ExecutionParams入参和OutExecutionOutput出参，对蓝图均不透明，这导致纯蓝图实际上是不可用的。如果你仍然希望通过蓝图来定义计算逻辑，可以先继承该类，并为蓝图暴露一些函数以获取和输出数值
> 
> 关于C++原生继承的部分可以看[知乎的一个帖子](https://zhuanlan.zhihu.com/p/1963398821410236165)，因为比较复杂这里先不详细写了，之后有时间在复习的时候再写

#### Gameplay Cues

抑制堆叠提示指的是：同一个GE堆叠时，是否抑制后面的GE触发Cue，如果勾选则只有第一层触发Cue而后续不触发；不勾选则每次都会触发

其中的GameplayCues数组的"幅度属性"指的是指定用来判断效果是否应用的数值，最低等级与最高等级限定了触发的条件范围。例如Attribute为造成伤害，等级0-10播放一种声音，10-20则播放另一种声音

配置什么效果播放则使用Gameplay提示标签配置，系统根据相应的标签寻找已注册的GameplayCue

#### 堆叠

堆叠样式指的是当该GE多次由同一目标触发或者对同一目标触发多次时的叠层方式。

- No Stacking：即不堆叠，产生两个相同的独立的GE，例如火球术攻击到同一目标时创建相同的GE
- Stack Per Source：当该GE的来源多次释放相同GE时叠层，例如一个牧师重复释放三次光环时力量翻三倍
- Stack Per Target：当该GE的拥有者多次被施加相同GE时叠层，例如三个法师都对敌人释放点燃则点燃叠三层

其中Stack Per Target和Stack Per Target模式下有几个可配置项：

- 堆栈限制计数：最大叠层，该值为0或-1时表示无上限
- 堆栈持续时间刷新策略，其中有一个枚举项为"Extand Duration"，即将持续时间叠加
- 堆栈周期重设策略，顾名思义
- 堆栈计数系数为一bool值，为true时表示Modifier的计算结果自动乘以StackCount，为false时则不影响数值。例如中毒效果每秒10点伤害，如果堆栈计数系数为true，则3层中毒时每秒10*3=30点伤害
- 溢出描述了满层后如何进行处理，可以选择触发额外的GE
  - 拒绝溢出应用表示满层后再次尝试施加GE时会拒绝施加