# Документация языка MAIN

## Введение

MAIN (Minecraft Automation INterface Language) - это язык программирования, созданный специально для автоматизации задач в Minecraft. Он позволяет игрокам управлять блоками, создавать сложные системы автоматизации и строить интерфейсы через специальный терминал.

## Основы языка

### Синтаксис

Язык MAIN имеет C-подобный синтаксис с простыми правилами:

- Комментарии начинаются с символа `#`
- Инструкции разделяются символом новой строки
- Блоки кода заключаются в фигурные скобки `{ }`
- Переменные объявляются с помощью ключевого слова `var`

### Пример простой программы

```
# Это комментарий
var message = "Привет, Minecraft!"
print(message)

# Управление блоком
var dispenserPos = [10, 64, 15]
activate(dispenserPos)
```

## Типы данных

### Числа
```
var integer = 42
var decimal = 3.14
```

### Строки
```
var text = "Hello, World!"
var blockId = "minecraft:stone"
```

### Массивы
```
var position = [10, 64, 15]  # координаты x, y, z
var inventorySlots = [0, 1, 2, 3]
```

### Логические значения
```
var isActive = true
var isRunning = false
```

## Переменные

Объявление и использование переменных:

```
var name = value          # объявление переменной с присваиванием
var counter = 0           # числовая переменная
var playerName = "Steve"  # строковая переменная
var position = [0, 64, 0] # массив координат
```

## Операторы

### Арифметические операторы
- `+` - сложение
- `-` - вычитание
- `*` - умножение
- `/` - деление
- `%` - остаток от деления

```
var a = 10
var b = 3
var sum = a + b      # 13
var diff = a - b     # 7
var product = a * b  # 30
var quotient = a / b # 3
var remainder = a % b # 1
```

### Операторы сравнения
- `==` - равно
- `!=` - не равно
- `<` - меньше
- `>` - больше
- `<=` - меньше или равно
- `>=` - больше или равно

### Логические операторы
- `and` - логическое И
- `or` - логическое ИЛИ
- `not` - логическое НЕ

## Управляющие конструкции

### Условия (if/else)

```
var x = 10
if x > 5 {
    print("x больше 5")
} else if x == 5 {
    print("x равен 5")
} else {
    print("x меньше 5")
}
```

### Циклы

#### While цикл
```
var counter = 0
while counter < 5 {
    print("Счетчик: " + counter)
    counter = counter + 1
    wait(20)  # ждать 1 секунду (20 тиков)
}
```

#### For цикл
```
for in 1 to 10 {
    print("Итерация: " + i)
    activate([10, 64, 15 + i])
}
```

## Встроенные функции

### Функции управления блоками

#### activate(blockPos)
Активирует блок (например, раздатчик, кнопку и т.д.)

```
var dispenser = [10, 64, 15]
activate(dispenser)
```

#### getBlockType(blockPos)
Получает тип блока в указанных координатах

```
var blockType = getBlockType([10, 64, 15])
print("Тип блока: " + blockType)
```

#### moveItems(fromPos, toPos, item, quantity)
Перемещает предметы из одного инвентаря в другой

```
var chest1 = [11, 64, 14]
var chest2 = [11, 64, 16]
moveItems(chest1, chest2, "minecraft:cobblestone", 32)
```

#### getItemCount(item, area...)
Получает количество предмета в указанных инвентарях

```
var stoneCount = getItemCount("minecraft:stone", [10, 64, 15], [11, 64, 15])
print("Количество камня: " + stoneCount)
```

#### craft(crafterPos, recipe, quantity)
Запускает процесс крафта

```
var crafter = [12, 64, 15]
craft(crafter, "minecraft:torch", 64)
```

### Функции задержки и синхронизации

#### wait(ticks)
Приостанавливает выполнение на указанное количество тиков (1 тик = 0.05 секунд)

```
print("Начало")
wait(40)  # ждать 2 секунды
print("Конец")
```

### Функции ввода/вывода

#### print(message)
Выводит сообщение в консоль терминала

```
print("Сообщение в консоль")
var x = 42
print("Значение x: " + x)
```

## GUI функции

### createWindow(title, width, height)
Создает новое окно

```
var window = createWindow("Мой интерфейс", 300, 200)
```

### addButton(window, x, y, width, height, label, action)
Добавляет кнопку в окно

```
var window = createWindow("Управление", 200, 100)
addButton(window, 10, 80, 20, "Старт", "startProcess()")
```

### addLabel(window, x, y, text)
Добавляет текстовую метку в окно

```
addLabel(window, 10, 40, "Статус: готов")
```

### showWindow(window)
Отображает окно

```
showWindow(window)
```

## Примеры программ

### Пример 1: Автоматический раздатчик

```
# Автоматический раздатчик камня
var dispenserPos = [10, 64, 15]
var targetCount = 64

while true {
    var currentCount = getItemCount("minecraft:cobblestone", dispenserPos)
    if currentCount < targetCount {
        moveItems([11, 64, 15], dispenserPos, "minecraft:cobblestone", targetCount - currentCount)
    }
    activate(dispenserPos)
    wait(20)  # ждать 1 секунду
}
```

### Пример 2: Интерфейс автокрафта

```
# Создание интерфейса для управления автокрафтом
var window = createWindow("Автокрафт", 250, 180)

addLabel(window, 10, 10, "Система автокрафта")
addLabel(window, 10, 30, "Статус: Ожидание")

var startBtn = addButton(window, 10, 50, 100, 20, "Начать", "startCrafting()")
var stopBtn = addButton(window, 120, 50, 100, 20, "Стоп", "stopCrafting()")

var targetSlider = addSlider(window, 10, 80, 200, 20, 0, 64, 16)
addLabel(window, 10, 110, "Цель: " + getValue(targetSlider))

addProgressBar(window, 10, 140, 200, 15, getCurrentProgress(), 100)
showWindow(window)
```

### Пример 3: Система хранения

```
# Мониторинг системы хранения
var storageChests = [
    [10, 64, 15],
    [11, 64, 15],
    [12, 64, 15],
    [13, 64, 15]
]

while true {
    var totalStone = 0
    var totalIron = 0
    
    for i in 0 to length(storageChests)-1 {
        totalStone = totalStone + getItemCount("minecraft:cobblestone", storageChests[i])
        totalIron = totalIron + getItemCount("minecraft:iron_ingot", storageChests[i])
    }
    
    print("Общее количество камня: " + totalStone)
    print("Общее количество железа: " + totalIron)
    
    wait(100)  # проверять каждые 5 секунд
}
```

## Безопасность и ограничения

### Ограничения выполнения
- Максимум 1000 операций за один цикл выполнения
- Максимальное время выполнения скрипта: 5 секунд
- Ограничение радиуса действия: 32 блока от терминала
- Защита от бесконечных циклов без wait()

### Права доступа
- Терминал может взаимодействовать только с блоками, к которым у игрока есть доступ
- Нельзя управлять блоками других игроков без разрешения

## Отладка

### Обработка ошибок
Скрипты MAIN обрабатывают ошибки безопасно:
- При ошибках выполнения скрипт останавливается
- Ошибка отображается в консоли терминала
- Другие скрипты продолжают работу

### Логирование
Используйте функцию `print()` для отладки:

```
var x = 10
print("Значение x до операции: " + x)
x = x * 2
print("Значение x после операции: " + x)
```

## Совместимость с модами

Язык MAIN изначально поддерживает взаимодействие с:
- Блоками Minecraft vanilla
- Популярными модами автоматизации (если установлены)
- Блоками других модов через API

## Заключение

Язык MAIN предоставляет мощный инструмент для автоматизации задач в Minecraft. С его помощью можно создавать сложные системы автоматизации, управлять производственными линиями и создавать интерактивные интерфейсы. Язык прост в изучении, но мощен в применении.
