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

给角色添加GA用AbilitySystemComponent的GiveAbility函数（或者节点），指定一个Ability Class添加

释放GA的方式则有两种，一种是根据类直接触发，一种则是通过Tag触发（这样会激活所有该Tag的GA）

