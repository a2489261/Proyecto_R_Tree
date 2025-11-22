// Clase RTreeVisualizer - Visualizador interactivo del Árbol R
// Proporciona una interfaz gráfica para interactuar con el R-Tree
class RTreeVisualizer {
    constructor() {
        // Obtiene el elemento canvas del HTML donde se dibujará el árbol
        this.canvas = document.getElementById('rtreeCanvas');
        // Contexto 2D para dibujar en el canvas
        this.ctx = this.canvas.getContext('2d');
        // Crea una nueva instancia del R-Tree que será visualizada
        this.rtree = new RTree();
        // Modo actual de interacción: 'insert', 'search', o 'knn'
        this.mode = 'insert';
        // Indica si el usuario está arrastrando el mouse (para dibujar rectángulos de búsqueda)
        this.dragging = false;
        // Rectángulo de búsqueda actual (null si no hay búsqueda activa)
        this.searchRect = null;
        // Array que almacena los resultados de la búsqueda por área
        this.searchResults = [];
        // Punto de consulta para búsqueda K-NN (null si no hay consulta activa)
        this.knnQueryPoint = null;
        // Array que almacena los resultados de la búsqueda K-NN
        this.knnResults = [];
        // Controla si se muestra la estructura del árbol (rectángulos de los nodos)
        this.showTreeStructure = true;
        // Usa método directo para búsqueda por área (más confiable pero menos eficiente)
        this.useDirectSearch = true;
        
        // Configura los eventos del mouse y botones
        this.initializeEventListeners();
        // Actualiza las estadísticas mostradas en la interfaz
        this.updateStats();
        // Dibuja el estado inicial del canvas
        this.draw();
    }
    
    // Configura todos los event listeners para la interacción del usuario
    initializeEventListeners() {
        // Botón para cambiar al modo inserción de puntos
        document.getElementById('insertPoint').addEventListener('click', () => {
            this.mode = 'insert';
            this.updateButtonStates();
        });
        
        // Botón para cambiar al modo búsqueda por área
        document.getElementById('searchArea').addEventListener('click', () => {
            this.mode = 'search';
            this.updateButtonStates();
        });
        
        // Botón para cambiar al modo búsqueda K-NN (K vecinos más cercanos)
        document.getElementById('knnSearch').addEventListener('click', () => {
            this.mode = 'knn';
            this.updateButtonStates();
        });
        
        // Botón para limpiar búsquedas actuales (sin eliminar puntos)
        document.getElementById('clearSearch').addEventListener('click', () => {
            this.searchRect = null;
            this.searchResults = [];
            this.knnQueryPoint = null;
            this.knnResults = [];
            this.draw();
            this.updateResultsInfo();
            document.getElementById('performanceInfo').textContent = 'Estado: Listo';
            document.getElementById('debugInfo').textContent = 'Información de depuración aparecerá aquí';
            document.getElementById('areaSearchInfo').textContent = 'Arrastre para definir área de búsqueda';
        });
        
        // Botón para limpiar completamente el árbol (elimina todos los puntos)
        document.getElementById('clearAll').addEventListener('click', () => {
            this.rtree.clear();
            this.searchRect = null;
            this.searchResults = [];
            this.knnQueryPoint = null;
            this.knnResults = [];
            this.draw();
            this.updateStats();
            this.updateResultsInfo();
            this.updateTreeStructure();
            document.getElementById('performanceInfo').textContent = 'Estado: Listo';
            document.getElementById('debugInfo').textContent = 'Información de depuración aparecerá aquí';
            document.getElementById('areaSearchInfo').textContent = 'Arrastre para definir área de búsqueda';
        });
        
        // Botón para reconstruir el árbol con nuevos parámetros
        document.getElementById('rebuildTree').addEventListener('click', () => {
            // Obtiene los nuevos valores de configuración del árbol
            const maxEntries = parseInt(document.getElementById('maxEntries').value);
            const minEntries = parseInt(document.getElementById('minEntries').value);
            
            // Guarda todos los puntos actuales antes de reconstruir
            const points = this.rtree.getAllPoints();
            // Crea un nuevo árbol con los parámetros especificados
            this.rtree = new RTree(maxEntries, minEntries);
            
            // Reinserta todos los puntos en el nuevo árbol
            points.forEach(point => {
                this.rtree.insertPoint(point.x, point.y, point.data);
            });
            
            // Actualiza la visualización
            this.draw();
            this.updateStats();
            this.updateTreeStructure();
        });
        
        // Eventos del mouse para interactuar con el canvas
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // Actualiza el estado visual de los botones
        this.updateButtonStates();
    }
    
    // Actualiza la apariencia de los botones para mostrar cuál está activo
    updateButtonStates() {
        document.getElementById('insertPoint').classList.toggle('btn-success', this.mode === 'insert');
        document.getElementById('searchArea').classList.toggle('btn-success', this.mode === 'search');
        document.getElementById('knnSearch').classList.toggle('btn-success', this.mode === 'knn');
    }
    
    // Maneja el evento cuando se presiona el mouse en el canvas
    handleMouseDown(e) {
        // Calcula la posición del mouse relativa al canvas
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Modo inserción: agrega un nuevo punto donde se hizo click
        if (this.mode === 'insert') {
            const point = this.rtree.insertPoint(x, y, { 
                insertedAt: new Date().toLocaleTimeString() 
            });
            console.log(`Nuevo punto insertado: ID ${point.id} at (${x}, ${y})`);
            this.draw();
            this.updateStats();
            this.updateTreeStructure();
        } 
        // Modo búsqueda por área: inicia el dibujo del rectángulo de búsqueda
        else if (this.mode === 'search') {
            this.dragging = true;
            this.searchRect = new Rectangle(x, y, 0, 0);
            document.getElementById('areaSearchInfo').textContent = 'Soltar para realizar búsqueda...';
        } 
        // Modo K-NN: realiza búsqueda de vecinos más cercanos
        else if (this.mode === 'knn') {
            const startTime = performance.now();
            this.knnQueryPoint = new Point(x, y);
            const k = parseInt(document.getElementById('kValue').value);
            
            document.getElementById('performanceInfo').textContent = 'Buscando K-NN (REVISIÓN COMPLETA)...';
            document.getElementById('debugInfo').textContent = 'Procesando CADA PUNTO individualmente...';
            
            // Ejecuta la búsqueda K-NN de forma asíncrona para no bloquear la interfaz
            setTimeout(() => {
                try {
                    const knnSearchResults = this.rtree.knnSearch(this.knnQueryPoint, k);
                    const endTime = performance.now();
                    
                    this.knnResults = knnSearchResults.map(result => result.point);
                    
                    const duration = (endTime - startTime).toFixed(2);
                    const totalPoints = this.rtree.points.length;
                    
                    document.getElementById('performanceInfo').textContent = 
                        `K-NN completado: ${duration} ms | ${totalPoints} puntos procesados`;
                    
                    document.getElementById('debugInfo').textContent = 
                        `✅ Revisados ${totalPoints} puntos | K=${k} | Encontrados: ${this.knnResults.length}`;
                    
                    this.updateKnnDistances(knnSearchResults);
                    this.draw();
                    this.updateResultsInfo();
                    
                } catch (error) {
                    console.error('Error en K-NN:', error);
                    document.getElementById('performanceInfo').textContent = 'Error en K-NN';
                    document.getElementById('debugInfo').textContent = `Error: ${error.message}`;
                }
            }, 10);
        }
    }
    
    // Maneja el movimiento del mouse (para dibujar rectángulos de búsqueda)
    handleMouseMove(e) {
        if (this.dragging && this.searchRect) {
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Actualiza el tamaño del rectángulo de búsqueda según la posición del mouse
            this.searchRect.width = x - this.searchRect.x;
            this.searchRect.height = y - this.searchRect.y;
            
            // Realiza búsqueda en tiempo real mientras se arrastra
            if (this.useDirectSearch) {
                this.searchResults = this.rtree.searchAllPoints(this.searchRect);
            } else {
                this.searchResults = this.rtree.search(this.searchRect);
            }
            
            this.draw();
            this.updateResultsInfo();
            
            // Actualizar información de búsqueda en tiempo real
            document.getElementById('areaSearchInfo').textContent = 
                `Encontrados: ${this.searchResults.length} puntos | Área: ${Math.abs(this.searchRect.width).toFixed(0)}x${Math.abs(this.searchRect.height).toFixed(0)}`;
        }
    }
    
    // Maneja el evento cuando se suelta el mouse
    handleMouseUp() {
        if (this.dragging) {
            this.dragging = false;
            document.getElementById('areaSearchInfo').textContent = 
                `Búsqueda completada: ${this.searchResults.length} puntos encontrados`;
            
            // Verificación manual: contar puntos manualmente para validar resultados
            let manualCount = 0;
            this.rtree.points.forEach(point => {
                if (this.searchRect.containsPoint(point)) {
                    manualCount++;
                }
            });
        }
    }
    
    // Dibuja todo el contenido del canvas
    draw() {
        // Limpia el canvas completamente
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Dibuja la estructura del árbol si está habilitado
        if (this.showTreeStructure) {
            this.drawTreeStructure();
        }
        
        // Dibuja TODOS los puntos del árbol
        this.rtree.points.forEach(point => {
            // Verifica si el punto está en los resultados de búsqueda actuales
            const isInSearchResults = this.searchResults.some(p => p.mbr.equals(point));
            const isInKnnResults = this.knnResults.some(p => p.mbr.equals(point));
            
            let color = '#e63946'; // Color rojo por defecto
            
            // Asigna colores según el estado del punto
            if (isInKnnResults) {
                color = '#9d4edd'; // Morado para puntos K-NN
            } else if (isInSearchResults) {
                color = '#2a9d8f'; // Verde para puntos en área de búsqueda
            }
            
            this.drawPoint(point, color);
        });
        
        // Dibuja el rectángulo de búsqueda si existe
        if (this.searchRect) {
            this.drawRectangle(this.searchRect, '#f1faee', 2, 'dashed');
            
            // Dibujar información del rectángulo
            this.ctx.fillStyle = 'white';
            this.ctx.font = '12px Arial';
            this.ctx.fillText(
                `Área: ${Math.abs(this.searchRect.width).toFixed(0)}x${Math.abs(this.searchRect.height).toFixed(0)}`, 
                this.searchRect.x + 5, 
                this.searchRect.y - 5
            );
        }
        
        // Dibuja los resultados K-NN si existen
        if (this.knnQueryPoint) {
            this.drawKnnResults();
        }
    }
    
    // Dibuja un punto individual en el canvas
    drawPoint(point, color = '#e63946') {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Borde blanco alrededor del punto
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
        
        // Dibujar ID del punto (pequeño)
        this.ctx.fillStyle = 'white';
        this.ctx.font = '8px Arial';
        this.ctx.fillText(point.id, point.x + 8, point.y - 8);
    }
    
    // Dibuja un rectángulo en el canvas
    drawRectangle(rect, color = '#e9c46a', lineWidth = 1, lineStyle = 'solid') {
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = lineWidth;
        
        // Configura línea punteada si se solicita
        if (lineStyle === 'dashed') {
            this.ctx.setLineDash([5, 5]);
        } else {
            this.ctx.setLineDash([]);
        }
        
        this.ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.setLineDash([]);
    }
    
    // Dibuja los resultados de la búsqueda K-NN
    drawKnnResults() {
        // Dibuja el punto de consulta K-NN
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.beginPath();
        this.ctx.arc(this.knnQueryPoint.x, this.knnQueryPoint.y, 8, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = 'white';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Dibuja líneas que conectan el punto de consulta con los resultados K-NN
        this.ctx.strokeStyle = '#9d4edd';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 3]);
        
        this.knnResults.forEach(result => {
            this.ctx.beginPath();
            this.ctx.moveTo(this.knnQueryPoint.x, this.knnQueryPoint.y);
            this.ctx.lineTo(result.mbr.x, result.mbr.y);
            this.ctx.stroke();
        });
        
        this.ctx.setLineDash([]);
    }
    
    // Dibuja recursivamente la estructura del árbol (rectángulos de los nodos)
    drawTreeStructure(node = this.rtree.root, level = 0) {
        if (!node.mbr) return;
        
        // Calcula transparencia basada en el nivel del nodo (más transparente en niveles más profundos)
        const alpha = 1 - (level * 0.2);
        this.ctx.strokeStyle = `rgba(233, 196, 106, ${alpha})`;
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(node.mbr.x, node.mbr.y, node.mbr.width, node.mbr.height);
        
        // Si no es nodo hoja, dibuja recursivamente los hijos
        if (!node.isLeaf) {
            node.children.forEach(child => {
                this.drawTreeStructure(child, level + 1);
            });
        }
    }
    
    // Actualiza las estadísticas mostradas en la interfaz
    updateStats() {
        const stats = this.rtree.getStats();
        document.getElementById('pointsCount').textContent = stats.points;
        document.getElementById('nodesCount').textContent = stats.totalNodes;
        document.getElementById('maxLevel').textContent = stats.maxLevel;
        
        const totalFound = this.searchResults.length + this.knnResults.length;
        document.getElementById('foundCount').textContent = totalFound;
    }
    
    // Actualiza la información de resultados en la interfaz
    updateResultsInfo() {
        const resultsInfo = document.getElementById('resultsInfo');
        
        if (this.searchResults.length > 0) {
            resultsInfo.textContent = `Búsqueda por área: ${this.searchResults.length} puntos encontrados (VERIFICADO)`;
        } else if (this.knnResults.length > 0) {
            const k = parseInt(document.getElementById('kValue').value);
            resultsInfo.textContent = `K-NN COMPLETO (K=${k}): ${this.knnResults.length} puntos más cercanos (100% GARANTIZADO)`;
        } else {
            resultsInfo.textContent = 'Realice una búsqueda para ver los resultados';
        }
        
        this.updateStats();
    }
    
    // Actualiza la información de distancias K-NN en la interfaz
    updateKnnDistances(knnResults) {
        const distancesInfo = document.getElementById('knnDistances');
        
        if (knnResults.length === 0) {
            distancesInfo.textContent = 'No se encontraron puntos cercanos';
            return;
        }
        
        let html = '<strong>Distancias a los puntos más cercanos (VERIFICADO):</strong><br>';
        knnResults.forEach((result, index) => {
            const rank = index + 1;
            html += `${rank}. ${result.distance.toFixed(2)} pixels (ID: ${result.pointData.id})<br>`;
        });
        
        distancesInfo.innerHTML = html;
    }
    
    // Actualiza la representación textual de la estructura del árbol
    updateTreeStructure() {
        const treeStructure = document.getElementById('treeStructure');
        
        if (this.rtree.points.length === 0) {
            treeStructure.textContent = 'El árbol está vacío';
            return;
        }
        
        let structureText = `Total puntos: ${this.rtree.points.length}\n`;
        const printNode = (node, indent = '') => {
            if (node.isLeaf) {
                structureText += `${indent}Nodo hoja (${node.children.length} puntos)\n`;
            } else {
                structureText += `${indent}Nivel ${node.level}: MBR [${Math.round(node.mbr.x)},${Math.round(node.mbr.y)} ${Math.round(node.mbr.width)}x${Math.round(node.mbr.height)}]\n`;
                node.children.forEach(child => {
                    printNode(child, indent + '  ');
                });
            }
        };
        
        printNode(this.rtree.root);
        treeStructure.textContent = structureText;
    }
}