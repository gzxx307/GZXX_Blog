# UE中的字符串

Tags: UE, 学习, 经验

UE中有很多种，或者说支持很多种字符串形式，分别这些字符串形式是很重要的。经常会出现在某种情况下需要用到字符串，但是不知道用哪个，还有TEXT宏的使用时机问题，所以写了个文档加深印象。

## TEXT相关

### TEXT()宏

TEXT宏的本质是将 C++ 原生的字符串字面量转换为 **TCHAR** 类型的宽字符串字面量，然后才能在UE字符串系统中进行进一步的处理。这会将原本原生 C++ 字符串转换到UE强大的字符串系统，可以说，这是C++字面量字符串进入UE字符串系统的入口。

**实现方式**

TEXT宏在不同平台上的展开形式不同，但核心原理是在字符串字面量前添加对应的宽字符前缀，让编译器直接生成目标编码的字面量。所有转换均在编译期完成，没有任何运行时开销。

**使用例**

```cpp
// 正确写法
FString Str1 = TEXT("Hello World");
FText Txt1 = FText::FromString(TEXT("欢迎来到游戏"));
FName Name1 = FName(TEXT("PlayerStart"));

// 不推荐写法
FString Str2 = "Hello World";
```

> 为什么不推荐不加 TEXT()？
>
> `"Hello World"` 是 C++ 的窄字符字面量，类型为 `const char*`（ANSI 编码）。FString 内部有从 `const ANSICHAR*` 构造的隐式转换构造函数，因此这行代码**不会编译报错**，但会在运行时触发一次 ANSI→TCHAR 的逐字符转换，存在额外的性能开销。更严重的是，ANSI 编码只覆盖有限的字符集，一旦字面量中包含非 ASCII 字符（如中文），就会产生乱码。TEXT() 在编译期就完成了编码处理，无运行时代价，是正确的写法。

### LOCTEXT()与NSLOCTEXT()

LOCTEXT和NSLOCTEXT宏是专门为本地化文本设计的宏。

该宏本质上是在编译阶段生成一个键值对。在编译后启动虚幻编辑器时，会为每个键值对提供本地化功能，可以在项目设置中为每个由该宏生成的键值对添加语言选项，在不同语言选项下显示对应语言的字符串。

键由`Namespace + Key`组成，Namespace用于分区，Key则是在该分区下的具体的键。如果没有查找到任何对应的本地化键值对，则直接返回定义时传入的字符串。

命名空间可以用点分隔来组织，如`MyGame.UI.MainMenu`，但UE的本地化系统不会真正解析层级结构，点只是字符串的一部分，仅起到视觉上分类的作用。

**使用例**

```cpp
// 无需LOCTEXT_NAMESPACE宏定义
FText Text1 = NSLOCTEXT("MyGame.MyActor", "Key1", "文本1");
FText Text2 = NSLOCTEXT("MyGame.MyActor", "Key2", "文本2");
FText Text3 = NSLOCTEXT("MyGame.MyActor", "Key3", "文本3");

// 使用 LOCTEXT 时需要先定义LOCTEXT_NAMESPACE
#define LOCTEXT_NAMESPACE "MyGame.MyActor"
FText Text4 = LOCTEXT("Key1", "文本1");
FText Text5 = LOCTEXT("Key2", "文本2");
FText Text6 = LOCTEXT("Key3", "文本3");

// 中途切换命名空间，先取消旧的命名空间宏定义，再定义新的
#undef LOCTEXT_NAMESPACE
#define LOCTEXT_NAMESPACE "MyGame.NewActorName"

// 文件末尾必须取消定义
#undef LOCTEXT_NAMESPACE
```

> 为什么文件末尾必须 `#undef LOCTEXT_NAMESPACE`？
>
> `#define` 是预处理器指令，其作用域从定义点延伸到整个翻译单元（或下一个 `#undef`）。如果不在末尾取消定义，当其他文件通过 `#include` 包含该文件时，`LOCTEXT_NAMESPACE` 宏会意外泄漏进那些文件，导致它们的 `LOCTEXT()` 使用了错误的命名空间。这种错误非常隐蔽，不会有任何编译警告，但是会非常严重。

一般与FText类型配合使用

### 特性

**宏展开**

TEXT通过宏展开的方式适配所有平台与语言。`TEXT("xxx")` 在 Windows 上等价于 `L"xxx"`。原理是TCHAR的类型定义会随平台不同而改变，TEXT宏也跟着展开为对应的字面量前缀，保证编码统一，从而在各平台下都能正确显示全球字符。

```cpp
// 源码
const TCHAR* Message = TEXT("游戏开始");

// Windows平台展开（wchar_t，2 字节，UTF-16LE）
const wchar_t* Message = L"游戏开始";

// Linux/macOS平台展开（char16_t，2 字节，UTF-16）
const char16_t* Message = u"游戏开始";
```

**支持宏嵌套**

可以在TEXT宏中嵌套其他宏，也可以将TEXT宏放入其他宏中，例如：`TEXT("MyString_" MACRO_SUFFIX)`

**不可省略**

在 `FString::Printf`、`LOCTEXT`、`NSLOCTEXT` 等与UE字符串相关的地方必须使用。

**本地化支持**

UE还提供了本地化系统（即LOCTEXT与NSLOCTEXT），使用TEXT能够更好更方便的使用本地化功能。

**性能**

TEXT由于使用的是C++中的宏，其在编译期就会对字符串进行预处理，节省了运行时的开销。

```cpp
// 源代码
const TCHAR* Str = TEXT("Test");

// Windows（wchar_t，2 字节）
const wchar_t* Str = L"Test";

// Linux平台（char16_t，2 字节）
const char16_t* Str = u"Test";
```

## UE 中的三种字符串类型

### FString

FString的本质实际上是`TArray<TCHAR>`，但它拥有标准字符串与TArray的双重操作方式，这意味着它能够进行TArray的动态分配操作（`Append`、`Remove`），标准字符串操作（`+`、`+=`等）。

**实现方式**

FString在源码中以 `TArray<TCHAR>` 作为私有成员存储字符串内容。由于底层是独立的数组，每个 FString 对象拥有自己的内存，复制一个 FString 就会完整复制底层数组，这与 FName/FText 通过索引共享存储的方式有本质区别。`operator*` 返回的就是这个数组的底层 `TCHAR*` 指针。

FString可以直接与 `std::string` 互转（`FString::FromStdString` / `ToStdString`），但就上文所说，不使用TEXT宏直接转换会丢失本地化特性。

**与其他类型的转换**

FString 和其他类型之间不存在隐式转换，但 FString 可以由 `const TCHAR*` 和 `const ANSICHAR*`（即原始 `"..."` 字面量）隐式构造。从 `const ANSICHAR*` 构造时会触发运行时的 ANSI→TCHAR 转换，效率低于直接使用 `const TCHAR*`，因此始终应配合TEXT()宏。

| 来源 | 目标 | 方式 |
|---|---|---|
| `const TCHAR*` | `FString` | 隐式构造，直接使用 |
| `const ANSICHAR*`（即 `"..."`）| `FString` | 隐式构造，但有运行时转换开销，不推荐 |
| `FName` | `FString` | `Name.ToString()`，无隐式转换 |
| `FText` | `FString` | `Text.ToString()`，**有损**，丢失本地化历史 |
| `FString` | `FName` | `FName(*MyStr)`，需显式构造和解引用 |
| `FString` | `FText` | `FText::FromString(MyStr)` 或 `FText::AsCultureInvariant(MyStr)` |

**使用场景**

日志、文件路径、JSON 解析、运行时拼接、临时数据，以及不需要本地化的文本。

**常用API**

```cpp
FString Str = TEXT("Player");
Str += TEXT("_01");// "Player_01"
Str.AppendChar('!');// 原地修改，"Player_01!"
Str.ToLower();// 返回新 FString，原字符串不变
Str.ToLowerInline();// 原地转小写，直接修改自身
Str.Find(TEXT("Player"));// 返回 int32 索引，未找到则返回 INDEX_NONE（即 -1）
Str.Contains(TEXT("Player"));// 返回 bool，只判断是否包含
Str.IsEmpty();// bool
*Str;// 解引用，转为 TCHAR*，一般用于Printf
```

> 为什么 `Find` 找不到时返回 `INDEX_NONE`（`-1`）而不是直接返回 `false`？
>
> `Find` 的设计目的是同时告知"是否存在"和"在哪里"，返回索引可以直接用于后续的字符串切割（`Left`、`Mid`、`Right`）。如果只需要判断是否包含，应使用 `Contains`，它返回 `bool`，语义更明确，也无需处理 `INDEX_NONE` 的判断。

### FText

FText一般用于**所有面向玩家的文本**以及其他任何必须本地化的内容。

FText能够根据选择的语言自动加载对应的翻译表，本质上是通过键值对对对应的文本进行查找。

**实现方式**

FText内部持有一份**文本历史（Text History）**，记录了这段文本是通过哪种方式创建的——来自LOCTEXT键、Format构造、AsNumber转换、还是FromString直接创建等。本地化系统依赖这份历史来查找对应语言的翻译。这也是FText不可直接修改的根本原因：一旦修改了内部字符串而不同步更新历史，本地化查找链就会断裂。

另外，FText**不可直接修改其内容**，这是为了防止破坏本地化。如果需要创建可变FText，推荐使用FText的`Format()`静态函数构造FText，这样可以保持本地化结构，例如

```cpp
FText Formatted = FText::Format(
    LOCTEXT("Pattern", "玩家: {0}"),
    FText::FromString(PlayerName)
);

// 也可以根据数字/日期格式化
FText NumberText = FText::AsNumber(1000);
FText DateText = FText::AsDate(FDateTime::Now());
```

**创建方式**

```cpp
#define LOCTEXT_NAMESPACE "MyGame"

// 在所属命名空间下，以"Welcome"为键，"欢迎来到游戏"为值创建可本地化的键值对文本
FText Txt = LOCTEXT("Welcome", "欢迎来到游戏");

// 单独指定命名空间
FText Txt2 = NSLOCTEXT("MyGame", "WelcomeKey", "欢迎来到游戏");

// 运行时动态内容（如玩家名、外部API数据），明确标记为不可本地化
FText Txt3 = FText::AsCultureInvariant(TEXT("PlayerName_From_Server"));

// 不推荐：无本地化键，会被工具链误报为遗漏翻译的文本
FText Txt4 = FText::FromString(TEXT("纯运行时文本"));

#undef LOCTEXT_NAMESPACE
```

> 为什么运行时动态内容推荐用 `AsCultureInvariant` 而不是 `FromString`？
>
> 两者都会创建没有本地化键的 FText，但 `AsCultureInvariant` 会明确标记该文本"不应被本地化"，本地化检查工具识别这个标记后不会将其误报为"遗漏翻译的文本"。`FromString` 没有这个标记，在本地化工作流中会被当作待翻译内容产生误报。官方建议：玩家名、IP、外部 API 数据等动态内容使用 `AsCultureInvariant`，真正需要翻译的文本使用 `LOCTEXT`/`NSLOCTEXT`。

> 为什么 `FText` 转成 `FString`（`Text.ToString()`）是有损操作？
>
> `ToString()` 只提取了当前语言下的显示字符串，完全丢弃了文本历史（本地化键、格式化参数、来源信息等）。得到的 FString 只是此刻的一份快照，不再能被本地化系统识别，也无法随语言切换而更新内容。

### FName

FName是UE中最高效的字符串类型，但不是传统意义上的字符串。FName通常是不可变的，存储在UE的**全局名称表（Global Name Table）**中，需要查找和比较时通过其在名称表中的索引即可。

UE将FName设计为具有高效搜索和比较的不可变字符串类型，通常用于Actor 名称、Component 名称、Bone 名称、Animation Montage 名称、DataTable Row Name、Tag 等**标识符**。

**实现方式**

FName在内部存储为两个数字：一个**比较索引（Comparison Index）**指向全局名称表中的某个唯一字符串条目，以及一个**实例编号（Number）**用于区分同名但编号不同的 FName（例如引擎自动生成 `Actor_0`、`Actor_1` 时）。全局名称表使用哈希表保证字符串唯一性，相同字符串只存储一份。在编辑器构建（`WITH_CASE_PRESERVING_NAME=1`）中，还会额外存储一个**显示索引（Display Index）**以保留原始大小写用于显示，而比较时始终使用 Comparison Index（大小写无关）。

**特性**

- 大小写不敏感（`Player` == `player`），但大小写保留（存储时不改变原始大小写，只是比较时忽略）。
- 比较速度 O(1)，因为只需比较两个整数索引，而不是逐字符比较。
- 内存共享，相同字符串在全局名称表中只存储一份。
- 不可修改，一旦创建就固定（所谓"修改"实际上是在表中创建了一个新条目，并得到一个新的 FName）。
- 不能用于显示（不带本地化）。

**使用场景**

任何需要高频比较且不需要显示的场景。

**创建方式**

```cpp
FName Name1 = FName(TEXT("PlayerStart"));
FName Name2 = FName(*MyFString);// 从 FString 创建，需要解引用
FName Empty = NAME_None;// 空名称，等价于 FName()
```

> 为什么 FString 不能隐式转换为 FName？
>
> 创建 FName 并不是一个廉价操作，它需要计算哈希值、在全局名称表中查找或插入条目。如果允许隐式转换，开发者可能会在不知情的情况下频繁触发这个开销，例如在循环中将 FString 传给一个接受 FName 的函数。UE 要求显式写出 `FName(*MyStr)` 构造，让这个代价在代码层面可见，是一种主动的性能提示。

---

## 三种字符串类型对比表

| 特性 | FString | FText | FName |
|---|---|---|---|
| **可变性** | 可变 | 不可变（只能创建新对象）| 不可变 |
| **本地化** | 不支持 | 原生支持（I18N）| 不支持 |
| **内存** | 独立分配（TArray）| 共享引用 + 文本历史 | 全局名称表（共享）|
| **比较速度** | O(n) | O(n) | O(1) |
| **线程安全** | 需注意 | 安全（不可变） | 安全 |
| **典型用途** | 运行时操作、日志、路径 | UI、对话、任何玩家可见文本 | 标识符、名称、Tag |
| **是否推荐显示** | 仅调试用 | **必须**用于显示 | 绝不用于显示 |
| **格式化支持** | `Printf`（%s 风格）| `Format`（{0} 风格）| 不支持格式化 |

---

## 字符串中的变量嵌入

### FString

FString支持C风格的字符串格式化，通过 `FString::Printf` 函数实现，用法与标准库的 `printf` 相同。

```cpp
FString PlayerName = TEXT("张三");
int32 Score = 12345;
float Time = 12.34f;

FString Result = FString::Printf(
    TEXT("玩家 %s 的得分是 %d，耗时 %.2f 秒"), 
    *PlayerName,// 使用 * 解引用，传入 TCHAR*
    Score, 
    Time
);
```

> 为什么 `%s` 传入 FString 时必须加 `*` 解引用？
>
> `%s` 格式符期望的是 `TCHAR*`（裸指针），而 `PlayerName` 是 `FString` 对象。FString 重载了 `operator*`，调用它会返回内部 `TArray<TCHAR>` 的底层指针（`TCHAR*`）。如果不加 `*` 直接传入 `FString` 对象，传给 `%s` 的是 FString 对象本身的地址而不是字符串内容的地址，会造成格式化输出乱码甚至程序崩溃。

**常用格式符**

- `%s`：字符串（FString 需先用 `*` 解引用，或直接传 `TCHAR*`）
- `%d` / `%i`：整数
- `%f`：浮点数（可加 `.2f` 控制精度）
- `%lld`：int64
- `%u`：unsigned
- `%%`：转义百分号

### FText

FText与FString格式化不同，FText使用`{index}`风格格式化字符串，格式化顺序按照index定义的顺序进行，以更好的适配不同语言下语序不同的问题。

```cpp
#define LOCTEXT_NAMESPACE "UI"

// 定义格式字符串
FText FormatText = LOCTEXT("PlayerInfo", "玩家 {0} 的得分是 {1}，耗时 {2} 秒");

// 准备参数，这里需要先转成FText
FText NameText = FText::FromString(PlayerName);
FText ScoreText = FText::AsNumber(Score);
FText TimeText = FText::AsNumber(Time, &FNumberFormattingOptions::DefaultNoGrouping());

// 格式化
FText Result = FText::Format(FormatText, NameText, ScoreText, TimeText);

#undef LOCTEXT_NAMESPACE
```

也可以使用命名占位符（`{Name}` 风格），语义更清晰，推荐在占位符较多时使用，通过 `FText::FormatNamed` 传入：

```cpp
#define LOCTEXT_NAMESPACE "UI"

FText Result = FText::FormatNamed(
    LOCTEXT("PlayerInfo", "{PlayerName} 的得分是 {Score}"),
    TEXT("PlayerName"), FText::FromString(PlayerName),
    TEXT("Score"),      FText::AsNumber(Score)
);

#undef LOCTEXT_NAMESPACE
```

**优势**

支持不同语言调整占位符顺序（如中文"{0}得分{1}" vs 英文 "Score of {0} is {1}"）。自动处理复数、性别等本地化规则。

**快捷函数**：
```cpp
FText::AsNumber(12345);// 自动本地化数字格式（千分位、小数点等随区域变化）
FText::AsDate(FDateTime::Now());// 本地化日期格式
```
