# 🌳 Demo Visual R-tree

Una demostración interactiva y visual de la estructura de datos **R-tree** implementada en JavaScript, diseñada para facilitar el entendimiento de los árboles R y sus operaciones espaciales.

## 🚀 Características Principales

### 🔍 Operaciones del R-tree
- **Inserción de puntos** - Agregar puntos interactivamente al árbol
- **Búsqueda por área** - Encontrar puntos dentro de un rectángulo definido por el usuario
- **Búsqueda K-NN** - Localizar los K vecinos más cercanos a un punto de consulta
- **Visualización en tiempo real** - Ver la estructura del árbol y los MBRs (Minimum Bounding Rectangles)

### 🎨 Visualización Interactiva
- **Representación gráfica** de la estructura jerárquica del R-tree
- **Código de colores** para diferentes elementos:
  - 🔴 Puntos normales
  - 🟢 Puntos encontrados en búsquedas
  - 🟣 K-NN más cercanos
  - 🟠 Rectángulos R-tree
- **Estadísticas en tiempo real** del árbol

## 🛠️ Tecnologías Utilizadas

- **HTML5 Canvas** - Para renderizado gráfico
- **JavaScript ES6+** - Lógica del R-tree y manipulación del DOM
- **CSS3** - Estilos modernos con gradientes y efectos visuales

## 📁 Estructura del Proyecto

```
R-tree-Demo/
│
├── index.html              # Archivo principal con todo el código
├── README.md              # Este archivo
│
├── 📊 Características Visuales
│   ├── Canvas interactivo 800x600px
│   ├── Panel de controles lateral
│   ├── Leyenda de colores
│   └── Estadísticas en tiempo real
│
└── 🎯 Funcionalidades
    ├── Inserción de puntos por clic
    ├── Búsqueda por área con arrastre
    ├── Búsqueda K-NN configurable
    └── Reconstrucción del árbol con parámetros personalizables
```

## 🏗️ Arquitectura del Código

### Clases Principales

#### 1. **Point** - Representa puntos 2D
```javascript
class Point {
    constructor(x, y, data = null)
    // Propiedades: x, y, width, height, id
    // Métodos: intersects(), distanceTo(), union()
}
```

#### 2. **Rectangle** - Maneja rectángulos y MBRs
```javascript
class Rectangle {
    constructor(x, y, width, height)
    // Propiedades: minX, minY, maxX, maxY
    // Métodos: area(), intersects(), contains(), union()
}
```

#### 3. **RTreeNode** - Nodos del árbol R
```javascript
class RTreeNode {
    constructor(level, mbr = null)
    // Propiedades: level, mbr, children, isLeaf
    // Métritos: addChild(), removeChild(), updateMBR()
}
```

#### 4. **RTree** - Implementación principal del árbol R
```javascript
class RTree {
    constructor(maxEntries = 4, minEntries = 2)
    // Métodos: insertPoint(), search(), knnSearch(), getStats()
}
```

#### 5. **RTreeVisualizer** - Interfaz visual e interacción
```javascript
class RTreeVisualizer {
    constructor()
    // Manejo de eventos, dibujo en canvas, actualización de UI
}
```

## 🎮 Cómo Usar

### 1. **Insertar Puntos**
- Haz clic en el botón **"Insertar Punto"**
- Haz clic en cualquier lugar del canvas para agregar puntos

### 2. **Búsqueda por Área**
- Selecciona **"Buscar por Área"**
- Arrastra en el canvas para definir un rectángulo de búsqueda
- Los puntos dentro del área se resaltarán en verde

### 3. **Búsqueda K-NN**
- Haz clic en **"Búsqueda K-NN"**
- Establece el valor de K en el panel de configuración
- Haz clic en el canvas para encontrar los K puntos más cercanos

### 4. **Configuración del Árbol**
- Ajusta **Máx. entradas por nodo** y **Mín. entradas por nodo**
- Usa **"Reconstruir R-tree"** para aplicar los cambios

## ⚙️ Parámetros Configurables

| Parámetro | Valor por Defecto | Rango | Descripción |
|-----------|-------------------|-------|-------------|
| Máx. entradas por nodo | 4 | 2-10 | Controla la capacidad máxima de cada nodo |
| Mín. entradas por nodo | 2 | 1-5 | Mínimo de hijos antes de fusionar nodos |
| Valor de K (K-NN) | 5 | 1-50 | Número de vecinos a buscar |

## 📊 Métricas y Estadísticas

La interfaz muestra en tiempo real:
- ✅ **Puntos insertados** - Total de puntos en el árbol
- ✅ **Nodos R-tree** - Cantidad total de nodos
- ✅ **Nivel máximo** - Altura del árbol
- ✅ **Puntos encontrados** - Resultados de búsquedas actuales

## 🎯 Casos de Uso Educativos

Ideal para entender:
- **Estructuras de datos espaciales**
- **Algoritmos de búsqueda por proximidad**
- **Optimización de consultas geométricas**
- **Balanceo de árboles multidimensionales**

## 🔧 Personalización

### Modificar Colores
Los colores están definidos en el CSS dentro del `<style>`:
```css
.legend-color { background-color: #e63946; } /* Puntos normales */
.legend-color { background-color: #2a9d8f; } /* Puntos encontrados */
```

### Ajustar Tamaño del Canvas
Modificar en el HTML:
```html
<canvas id="rtreeCanvas" width="800" height="600"></canvas>
```

## 🚀 Ejecución

1. **Descarga** el archivo `index.html`
2. **Ábrelo** en cualquier navegador moderno
3. **¡Interactúa!** - No se requiere servidor ni instalación

## 📈 Rendimiento

- ✅ **Búsquedas optimizadas** usando la estructura jerárquica del R-tree
- ✅ **K-NN eficiente** con cálculo de distancias euclidianas
- ✅ **Visualización en tiempo real** sin bloqueo de la UI

## 🐛 Solución de Problemas

### Puntos no aparecen
- Verifica que el modo "Insertar Punto" esté activo
- Asegúrate de hacer clic dentro del área del canvas

### Búsquedas lentas
- Reduce el número máximo de puntos
- Aumenta los parámetros de nodo para un árbol más balanceado

## 🤝 Contribuciones

Las contribuciones son bienvenidas para:
- 🎨 Mejoras en la visualización
- ⚡ Optimizaciones de rendimiento
- 📚 Ejemplos educativos adicionales

## 📄 Licencia

Este proyecto está disponible para fines educativos y de investigación.
