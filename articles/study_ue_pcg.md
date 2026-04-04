# 在UE中使用PCG

Tags: UE, 经验, 知识

这个文档的目标一个是学会使用PCG，了解PCG在UE中的使用方法，如果有时间则可以挖掘其相对底层的原理，另外就是研究布尔运算与PCG的结合使用。

> **官方文档**：https://dev.epicgames.com/documentation/zh-cn/unreal-engine/procedural-content-generation-framework-in-unreal-engine
> 
> **初级教学视频**：https://www.bilibili.com/video/BV1R8YvzsEoL/?spm_id_from=333.337.search-card.all.click&vd_source=0748f696e1bda1e6909280682b804700
> 
> **基础教学贴**：https://zhuanlan.zhihu.com/p/648208410

## 概述

程序化内容生成（Procedural Content Generation，即PCG）能够通过程序的手段，自动生成相应的地形与植被等，能够极大的帮助美术师和设计师完成快速的场景创作，或者生成随机地图时提供自然的地形外貌。

要在UE中使用PCG进行开发，你首先需要启用程序化内容生成框架（Procedural Content Generation Framework）插件（该插件在5.7版本中已转为1.0正式版）。

另外，要在静态网格体上对点取样，你还需要启用程序化内容生成框架几何体脚本交互（Procedural Content Generation Framework Geometry Script Interop）插件。

> 什么是点取样？
>
> 简单来说，就是获取一个点的所有信息（可以在静态网格体的内部或者外部），这个点不单单指的是他的xyz坐标，而是获取该点的信息的数据结构，包括位置、法线、纹理坐标、切线、颜色等。

### 为什么选择PCG？

使用PCG，能够大幅降低构建世界的复杂程度，例如放置树木或者栅栏等。

另外，PCG在构建随机生成的地图上也非常适合，《文明》系列的游戏采用PCG的方式生成六边形网格世界，使得游戏地图看起来非常美观，也与我们计划实现的效果相同。

## 重要概念和术语

### 点

3D空间中的坐标点，由PCG图表生成，常用于生成网格体。 点包含变换、边界、颜色、密度、陡度和种子等信息。 可以为它们分配由用户自定义的属性值。

### 点密度

各种图表节点使用的值。 在调试视图中表示为每个点上的梯度，代表该点存在于该位置的概率。 例如密度0为黑色，密度1为白色。

### 属性

属性类似于变量，存储由其名称和类型定义的数据。 属性分为两类：

- 静态特性：固定且始终存在的特性。 这类特性以`$`开头，如`$Position`。
- 动态特性：在运行时创建的特性，并作为图表数据元数据的一部分存储。

### 元数据

元数据是为程序化生成过程中产生的点附加额外信息和属性的系统，用于管理点的特性，它允许你为每个点存储比内置属性（如位置、法线）更丰富的自定义数据，从而精细控制生成过程，并且能够作为类似变量传递信息。

### 元数据域

元数据拥有其所在的域，域决定了你可以保存的信息类型，以及之后你可以如何使用并修改该信息。 针对所有元数据点，你都必须了解哪些域受支持，以及哪些域是默认域。 选择域时，域以`@`为前缀。

你可以在使用PCG图表时使用三个域：

1. 数据（Data）域，使用`@Data`前缀。数据域仅限使用单个值，这意味着你不能像使用特性集那样存储多个值。 数据域的操作方式与其他域相同。 只要在特性前添加`@Data`前缀，就可以为其创建或添加特性，或使用元数据操作修改数据域。 例如，数据域中的特性 MyAttr 将变为`@Data.MyAttr`。
2. 点（Points）域，使用`@Points`前缀。
3. 元素（Elements）域，用于特性集，使用`@Elements`前缀。

## 程序化节点图表

程序化节点图表（PCG Graph）是PCG的核心，他与材质编辑器类似，使用传入的数据生成点，然后点经过一系列节点的筛选和修改，最终输出实时更新的结果。

要创建PCG图表资产，你只需要在内容浏览器中找到PCG Graph并选择基于模板创建或创建空图表。

### 模板

#### 官方模板

官方目前未给出每个官方模板的使用和内容说明（或许以后也不会给），这一部分可能需要以后自己进行探索或者查b站和知乎之类的。

#### 自定义模板

如果你想将你创建的图表设为模板并使用，只需要在细节面板中，将“为模板（Is Template）”勾选即可。

### 图表参数

PCG图表参数是由用户创建的可重载值，这有助于为各类情况创建可自定义的图表。

只需要在细节面板中的属性（Parameters）旁的“+”按钮即可添加新参数。

可以在细节面板中，或者在世界中选中使用该PCG图表的Actor，进一步选中PCG组件并打开细节面板，即可修改参数。

## 使用

要使用PCG Graph，有两种方法：

1. 直接将PCG Graph拖入场景中，此时会生成一个拥有一定范围的对象名为PCG体积（PCG Volume），该体积范围内即为PCG Graph的生效范围。
2. 在蓝图中添加PCG组件，在该组件的细节面板中的Graph选项，选择想要使用的PCG节点图表，点击生成（Generate）即可查看结果。

## 图表实例

你能够根据现有的PCG组件来生成对应的实例，只需选择一个PCG资产（例如场景中的PCG体积），在细节面板中保存点击保存实例（Save Instance）即可。

![](study_ue_pcg\CreatePCGGraphInstance.png)

或者，在内容浏览器中选择创建PCG图表实例，并打开该实例，选择该实例对应的图。

![](study_ue_pcg\SavePCGGraphInstance.png)

图表示例可以作为PCG子图表使用，在PCG图表中添加该子图表节点，节点能够展开并展示出各参数，你可以使用这些引脚来重载参数。

## PCG组件

PCG Graph还可以附属于Actor，在Actor中添加PCG组件即可。

![](study_ue_pcg\SearchPCG.png)

添加结束后可以点击生成按钮查看生成结果。

## 世界分区

文档中写道PCG支持世界分区，但作者并不知道世界分区是什么，可能会在另外的文档学习以及做笔记。

**官方文档**：https://dev.epicgames.com/documentation/zh-cn/unreal-engine/world-partition---data-layers-in-unreal-engine

在保存世界后自动生成的HLOD文件名为“分层细节级别”。

**官方文档**：https://dev.epicgames.com/documentation/zh-cn/unreal-engine/world-partition---hierarchical-level-of-detail-in-unreal-engine

**CSDN教学帖**：https://blog.csdn.net/qq_23030843/article/details/113751930

## 在PCG中调试

PCG中提供了多种调试方法，每一个节点都有各种调试选项：调试渲染、启用/禁用节点、检查。你可以在PCG图表中点击节点，在节点的细节面板中的Debug部分查看相关设置。

![](study_ue_pcg\DebugInPCG.png)

你还可以检查节点，右键节点并选择检查，以此在特性（Attributes）列表中显示某个节点所生成的所有点。

## 基础部分

### 简单实现

1. 创建PCG图。
2. 将PCG图拖入场景（或导入Actor中）。
3. 在图中创建“获取地形数据（Get Landscape Data）”节点与“表面采样器（Surface Sampler）”节点并连接。此时，你可以通过双击节点来观察节点的生成效果，你会看见黑白不一的立方体，分别代表不同的密度。再次双击取消预览。

![](study_ue_pcg\Simple.png)

4. 你可以选择将表面采样器的Out引脚连接”调试（Debug）”节点，以此在世界中观察该PCG图表的生成效果。你也可以连接“静态网格体生成器（Static Mesh Spawner）”节点，并在该节点细节面板中的“网格体选择器”中“网格体条目”数组中，添加一个新的索引，在该索引中设置你想要生成的网格体即可。

在表面采样器中，你可以选择是否仅采样高度，如果选择，那么生成的点将会仅包含地形的高度信息，点的z轴方向均将朝上；相应地，不选择仅采样高度，生成的点的z轴方向将是表面的法向。

![](study_ue_pcg\SimpleEffect.png)

5. 你也可以在表面采样器节点后添加各种节点，例如“变换点（Transform Points）”。该节点允许你为这些点设置随机的位置偏移、旋转、大小，随机范围能够在细节面板中设置。

![](study_ue_pcg\Details.png)

![](study_ue_pcg\TransformPoint.png)

## 在Actor中使用PCG

在蓝图右上角添加组件中搜索PCG，你会得到三个选项：

![](study_ue_pcg\PCGComponent.png)

1. PCG生成源：如果你的Actor挂载了PCG生成源，则该Actor将充当PCG运行时生成源。当你需要在游戏中动态生成时使用该组件。
2. PCG组件：与PCGVolume相似，引用PCG图表进行生成。但相比于PCGVolume，他能够读取Actor中的变量，使用更加灵活，也是下面主要介绍的内容。
3. PCG程序ISM组件：

### PCG组件

下面以视频中的例子介绍PCG组件中PCG图与Actor组件联动的用法，顺便介绍新节点。

在Actor中，我们可以创建样条线或静态网格体等等，然后让PCG图通过直接读取或读取变量的方式接受到这些组件的数据。

例如样条线，我们先为Actor添加样条线组件，然后在PCG图中获取样条线的数据并进行采样，最后进行调试，就能看到沿切线分布的创建出来的网格体了。

![](study_ue_pcg\PCGBP.png)

![](study_ue_pcg\PCGSampleLine.png)

对于需要在静态网格体表面生成的情况，我们首先添加一个静态网格体组件与静态网格体对象引用类型的变量，然后在构造函数中为静态网格体组件赋上变量的值，以观察PCG图在静态网格体表面生成的效果。

另外，我们还需要记录下Actor位置相对世界中心的偏移，否则PCG图生成的位置永远位于世界中心。

![](study_ue_pcg\StaticMeshGenerator.png)

直到跟教程到这里才发现，由于版本不同，5.7版本中需要启用Geometry Script Interop插件才能使用“网格体采样器”节点，并且该节点的可以重载的参数也存在区别。在5.7版本中，请以该文档为准。

准备好后，我们来到PCG图中，创建“获取Actor属性”节点，将Out引脚连接到“网格体采样器”节点中的Override引脚上，双击网格体采样器即可在左边看到生成调试的结果。

此时转到世界界面，你会发现生成的调试结果在世界中心。在调试前加上“变换点”节点，然后再次创建“获取Actor属性”，属性名设为Offset，将引脚连接到Offset Min和Offset Max上，就实现了生成结果位置的设定。

![](study_ue_pcg\Offset.png)

## 基础节点

下面是一些常用基础节点的总结，右侧细节面板中的大多数属性都能被重载，只需完整展示节点内容（点击节点下方箭头）。

### Surface Sampler表面采样器

对输入的Surface Data进行采样。

节点的常用设置：

- Points Per Squared Meter每平方米的点：控制每平方米内点的数量。
- Looseness松动：控制每个采样点之间距离的远近，0表示所有采样点集中于中心，1表示采样点可以位于整个单元格大小内的任意位置。如果发现增加Points Per Squared Meter不能再增多点的数量的话，就是受到了Losseness的限制，把Looseness调低可以增加采样点数量。

![](study_ue_pcg\Surface.png)

### Static Mesh Spawner静态网格生成器

由输入的点来生成Static Mesh。

- Mesh Entries：对用于生成的Mesh进行相关设置。是以数组的形式呈现的，也就是说一个Static Mesh Spawner节点的同一组点数据可以生成多类Static Mesh。

![](study_ue_pcg\StaticMeshSpawner.png)

### Transform Point变换点

为点添加范围内随机的Transform、Rotation和Scale。

- Apply to Attribute：可以将Transform Points的信息存到一个自定义的Transform类型的Attribte中，勾选后在Attribute Name中填入自己添加的Attribute的名称就行（关于Attribute我放在下一篇中详细说一说，可以先理解为支持用户自定义的点的属性）。
- Offset、Rotation、Scale：自己想要控制的相关属性的随机范围。
- Absolute Offset/Rotation/Scale：如果勾选使用Absolute后，这个节点的所有变化是相对于点的初始状态进行的，也就是说前面修改并存入Properties的相关属性变换会被这个节点无视。

![](study_ue_pcg\TransformPoint.png)

### Normal To Density法线转为密度

用点的z方向（法向）点乘指定的Normal的归一化向量，得到0-1的值，这样可以将点的朝向转换为点的点密度，用来表示与指定方向的相邻程度。

- Normal：世界空间下所指定方向的向量（计算点乘前引擎会做normalize）。
- Offset：对所有点的点乘结果进行统一相加，不过最终Density会被钳制在0-1之间。
- Strengh：控制点乘的计算强度，实际上就是在点乘后进行一个以1/Strengh为幂的幂函数计算。

![](study_ue_pcg\NormalToDensity.png)

### Density Filter密度过滤器

根据点的点密度对点进行过滤，细节面板中可以调整其范围与是否反向过滤。

### Bounds Modifier边界修改器

更改PCG图的影响范围Bounds的相关属性。

有五种对Bounds进行操作的模式：

1. Set：直接设置Bounds的边界。
2. Intersect：根据所给的边界信息得到一个新的bound之后，与点原本的bound取交集。如果没有相交，则bound的边界信息全变为0。
3. Include：根据所给的边界信息得到一个新的bound之后，与点原本的bound取并集。但是实际上不仅仅是并集，如果是不连续的两个区间，最终输出的bound会变为基于原本所有bound的两个极限边界组合而成的新bound，此bound是包括两个bound的最小边界范围。例如：点原本的边界信息是(-100,-100,-100)--(100,100,100)，输入的边界为(200,200,200)--(300,300,300)，则最终输出得到的边界为(-100,-100,-100)--(300,300,300)。
4. Translate：对Bound进行基于本地坐标的移动。
5. Scale：对Bound进行缩放。

### Self Pruning自动调整

对相同点源（自身）的点进行自修剪，用于解决相同点源中产生的点的重叠问题。

有四种处理模式（后两种还不知道怎么用）：

- Large to Small：优先考虑大盒子，保留box大的点。
- Small to Large：优先考虑小盒子，保留box小的点。
- All Equal：全部相等。
- Remove Duplicates：移除重复。

### Difference差异

对两个点集中有重叠部分的点进行取舍（相减），用于解决不同点源中产生的点的重叠问题，一般是Source - Differences。

- Density Function密度函数：有三种密度函数，用于对点密度处理的不同方式。
  1. Minimum：为重叠的点赋密度，该点重叠的点越多，点密度越低。
  2. Binary：只进行是否重叠的判断，如果重叠则删去。
  3. Limited Divide：

![](study_ue_pcg\Difference.png)

- Mode模式

### Get Spline Data获取样条线数据

获取样条线的数据信息，这个样条线的查找条件可以是自身Actor的样条线，也可以是世界范围内的所有样条线。

- Actor Filter：这个属性能够选择节点查找样条线的范围，其中“所有世界Actor”会遍历每个Actor，性能较差但可以无视自身PCG的边界。

### Spline Sampler样条线采样器

对获取到的样条线数据进行采样，可以选择多种采样尺寸（维度）和模式。

Dimension尺寸（维度）：用于设置采样器的采样方式。

1. On Spline样条线上：沿着样条线进行采样，选择该选项后，你可以调整样条线的Subdivision Per Segment每段内采样的次数，即每两个样条线控制点之间采样的次数。
2. On Interior内部上：在样条线内部进行采样，其中有几个重要的参数：内部采样间距、内边框采样间距、内部密度衰减曲线、已解除绑定。
  1. 内部采样间距：调整点的间距，间距越大，生成的点就越少。
  2. 内边框采样间距：调整点的大小，这会影响到解决物体体积冲突（“差异”节点）时的效果。
  3. 内部密度衰减曲线：设置样条线内部的点的密度曲线，距离样条线边缘越近，曲线中对应的x轴的值越大。
  4. 已解除绑定：是否根据Actor边界来限制样本生成域，选择True则忽略Actor边界并在整个样条线中生成。

![](study_ue_pcg\SplineSampler.png)

![](study_ue_pcg\SplineSamplerEffect.png)

### Density Noise密度噪声

5.7版本的噪声节点似乎名为AttributeNoise。虽然节点名和颜色与知乎的文档不同，但变量一致。

![](study_ue_pcg\DensityNoise.png)

为所有的点添加噪声，有多种控制噪声的模式：

- Set：直接设置Density的数值。
- Minimum：对每个点得到一个Noise数值之后，与点原本的Density数值进行比较，取其中的最小者。
- Maximum：对每个点得到一个Noise数值之后，与点原本的Density数值进行比较，取其中的最大者。
- Add：将获得的Noise数值直接与原本的Density相加。
- Multiply：将获得的Noise数值直接与原本的Density相乘。

### Copy Points拷贝点

复制点源Source到每个目标Target上，实现为已经生成的网格体进行采样。

- Setting：其中的各个属性的Inheritance，都有Relative、Source、Target之分：Relative是为复制得到的每个Point，用Source在本地空间中的数值为Target计算相关属性相对的数值；Source是为复制得到的每个Point，都用Source的属性数值去赋值；Target同理。

下面是使用例。

![](study_ue_pcg\CopyPoints.png)

实现基于已经生成的网格体进行采样，制作诸如树上的苔藓、蘑菇这样的挂载物，通过Transform Points对点进行一定程度的偏移。

### Get Actor Data获取Actor数据

- Actor Filter：过滤Actor的方法。
  - Self：得到的是PCG Component所附加到的actor自身上的信息。
  - Parent：得到的是PCG Component所附加到的actor的父级身上的信息。
  - Root：得到的是PCG Component所附加到的actor的层次结构顶部的父级身上的信息。
  - All actors in world：得到的是世界中所有Actor的信息，因为需要遍历世界中的所有actor，所以可能会很慢。
  - Original：如果是在一个没有分区的Volume中，Original和Self相同；但如果是对于分区的Volume来说，Original获得的就是最原本没有分区的Volume。
- Mode：采样的模式。
  - Parse Actor Component：对经由Filter处理后的Actor进行进行分析，如果actor是一个PCG Volume他就输出一个Volume，如果actor是一条样条线他就输出一个spline，如果actor是一组样条线的集合他就输出这个集合。
  - Get Single Point：得到actor的一个点（actor的pivot）。
  - Get Data from Property：提取actor的属性值并将其视为Attribute。
    - Property Name：要获取的Actor中属性（多为自定义的变量）的名称。
  - Get Data from PCG Component：允许从另一个PCG组件获取输出节点的结果
  - Get Data from PCG Component or Parse Compoent：上述两者的组合

### Input/Output

PCG图表的输入、输出节点，多用于图表与子图表嵌套时进行信息传递。

### Subgraph子图表

为当前的PCG图表添加子图。

### Distance距离

求距离(场)：对每一个Source求自身到Target的距离。

- Set Density：是否将求得的距离写入Density中。
- Maximum Distance：最大距离值。可以理解为将0-MaxDistance之间的值映射到0-1上。

## PCG与动态网格体

PCG中提供了简单的动态网格体的操作，包括布尔运算、将生成的点附加到网格体上、保存为资产等。

### 节点介绍

#### 起始节点生成动态网格体

- 创建空动态网格体：建立一个空的动态网格体数据，可以通过后面的节点进行修改。
- 静态网格体到动态网格体元素：选定一个静态网格体模型，将其转换为动态网格体。光是静态网格体没有办法进行动态网格体相关的操作，只有先将静态网格体转换为动态网格体才行。
- 生成动态网格体：为动态网格体数据生成动态网格体组件，你可以将生成的动态网格体组件挂载到指定的Actor上，只需将目标Actor连接到该节点的输入引脚中的Target Actor中即可。可以与上述两个节点结合使用。

![](study_ue_pcg\WithDynamicMesh.png)

- 样条线到网格体：传入一个样条线（必须为封闭），并将这个样条线的封闭体积转换为一个动态网格体。（细节面板中可以调整样条线的模式，但是还没试过各个选项的效果是什么样的）

![](study_ue_pcg\WithSpline.png)

创建空动态网格体并为其赋值，或者将已有的静态网格体转化为动态，是操作动态网格体的起步阶段。

### 修改

- 动态网格体变换：可以对指定网格体进行变换（应该是相对于原Transform）。
- 合并动态网格体：按顺序将所有连接到的动态网格体合成为一个网格体，该节点的In节点可以连接多个引脚。

![](study_ue_pcg\Change.png)

- 从点附加网格体：为点集生成静态网格体并附加到指定的动态网格体上，使用时需要传入动态网格体数据以及点集。在该节点的细节面板中可以设置为点生成网格体时使用的网格体，也可以在引脚中重载。

![](study_ue_pcg\FromPoint.png)

- 布尔运算：支持对模型进行布尔运算，即通过交集、并集、差集等方式对两个网格体进行运算，并最终得到一个运算后的模型。（布尔运算节点有许多种进行布尔运算的方法，但除了联合（并集）、相交（交集）、减（差集）这三个方法以外其他的方法还没有研究）

![](study_ue_pcg\Bool.png)

- 将动态网格体保存到资产：如果你不希望在游戏运行中直接使用生成的动态网格体，而是将他存储下来长期保存，则使用该节点。如果你新创建了一个这个节点，当你将动态网格体数据连接该节点时，会出现一个弹窗，让你选择你想要保存的资产的位置或者新建一个空资产保存。