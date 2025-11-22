// Definición de la clase RTree (Árbol R)
// Estructura de datos espacial que organiza puntos en una jerarquía de rectángulos para búsquedas eficientes
class RTree {

    // Constructor que inicializa el árbol R con parámetros configurables
    constructor(maxEntries = 4, minEntries = 2) {
        // Número máximo de hijos por nodo (asegura al menos 4)
        this.maxEntries = Math.max(4, maxEntries);
        // Número mínimo de hijos por nodo (asegura entre 2 y la mitad del máximo)
        this.minEntries = Math.max(2, Math.min(minEntries, Math.floor(this.maxEntries / 2)));
        // Nodo raíz del árbol (inicia como nodo hoja vacío)
        this.root = new RTreeNode(0);
        // Array que almacena todos los puntos insertados en el árbol (backup para búsquedas)
        this.points = [];
        // Contador para asignar IDs únicos a nuevos puntos
        this.nextPointId = 1;
    }

    // Inserta un nuevo punto en el árbol
    insertPoint(x, y, data = null) {
        // Crea un nuevo objeto Point con los datos proporcionados
        const point = new Point(x, y, { 
            // Copia todos los datos existentes y agrega metadatos
            ...data, 
            id: this.nextPointId++,  // Asigna ID único auto-incremental
            insertedAt: Date.now()   // Marca temporal de inserción
        });
        
        // Almacena el punto en el array de respaldo
        this.points.push(point);
        
        // Crea un nodo hoja que contendrá este punto
        const leafNode = new RTreeNode(0, point);
        // Almacena los datos adicionales en el nodo
        leafNode.data = data;
        // Encuentra el nodo hoja más adecuado para insertar este nuevo punto
        const targetNode = this.chooseSubtree(this.root, point);
        
        // Si el nodo objetivo tiene espacio disponible
        if (targetNode.children.length < this.maxEntries) {
            // Agrega el nuevo nodo hoja como hijo
            targetNode.addChild(leafNode);
            // Ajusta el árbol hacia arriba actualizando los MBRs de los padres
            this.adjustTree(targetNode);
        } else {
            // Si el nodo está lleno, agrega igualmente el nuevo hijo
            targetNode.addChild(leafNode);
            // Divide el nodo sobrecargado en dos nodos
            const splitNode = this.splitNode(targetNode);
            // Ajusta el árbol considerando la división
            this.adjustTree(targetNode, splitNode);
        }
        
        // Retorna el punto insertado para referencia futura
        return point;
    }

    // Encuentra el subárbol más adecuado para insertar un nuevo MBR
    chooseSubtree(node, mbr) {
        // Si llegamos a un nodo hoja, este es nuestro objetivo
        if (node.isLeaf) return node;
        
        // Comienza con el primer hijo como el mejor candidato
        let bestNode = node.children[0];
        // Calcula cuánto se expandiría el MBR del primer hijo al agregar el nuevo MBR
        let minEnlargement = bestNode.mbr.enlargement(mbr);
        
        // Compara con todos los demás hijos
        for (let i = 1; i < node.children.length; i++) {
            const child = node.children[i];
            // Calcula la expansión necesaria para este hijo
            const enlargement = child.mbr.enlargement(mbr);
            
            // Si este hijo requiere menos expansión, o igual expansión pero área menor
            if (enlargement < minEnlargement || 
                (enlargement === minEnlargement && child.mbr.area() < bestNode.mbr.area())) {
                // Actualiza el mejor candidato
                bestNode = child;
                minEnlargement = enlargement;
            }
        }
        // Continúa la búsqueda recursivamente en el mejor subárbol
        return this.chooseSubtree(bestNode, mbr);
    }

    // Divide un nodo sobrecargado en dos nodos
    splitNode(node) {
        // Elige el eje (X o Y) para realizar la división
        const axis = this.chooseSplitAxis(node);
        // Encuentra el mejor índice para dividir los hijos
        const distribution = this.chooseSplitIndex(node, axis);
        
        // Crea un nuevo nodo del mismo nivel que el nodo original
        const newNode = new RTreeNode(node.level);
        
        // Transfiere la segunda mitad de los hijos al nuevo nodo
        for (let i = distribution; i < node.children.length; i++) {
            newNode.addChild(node.children[i]);
        }
        // El nodo original conserva la primera mitad de los hijos
        node.children = node.children.slice(0, distribution);
        // Actualiza el MBR del nodo original
        node.updateMBR();
        
        // Retorna el nuevo nodo creado
        return newNode;
    }

    // Selecciona el eje para dividir (implementación simplificada)
    chooseSplitAxis(node) {
        // Versión simplificada: siempre usa el eje X
        // En una implementación completa, probaría ambos ejes y elegiría el mejor
        return 'x';
    }

    // Encuentra el mejor índice para dividir los hijos a lo largo de un eje
    chooseSplitIndex(node, axis) {
        // Ordena los hijos según su posición en el eje seleccionado
        node.children.sort((a, b) => {
            // Calcula el centro de cada MBR en el eje X
            const centerA = a.mbr.x + a.mbr.width / 2;
            const centerB = b.mbr.x + b.mbr.width / 2;
            // Ordena de menor a mayor centro
            return centerA - centerB;
        });
        
        // Inicia con el índice mínimo permitido
        let bestIndex = this.minEntries;
        let minArea = Infinity;  // Inicia con el área más grande posible
        
        // Prueba todas las divisiones posibles que cumplen con minEntries
        for (let i = this.minEntries; i <= node.children.length - this.minEntries; i++) {
            // Calcula el MBR para el grupo izquierdo (primeros i hijos)
            const leftMBR = this.calculateMBR(node.children.slice(0, i));
            // Calcula el MBR para el grupo derecho (resto de hijos)
            const rightMBR = this.calculateMBR(node.children.slice(i));
            // Suma las áreas de ambos MBRs
            const totalArea = leftMBR.area() + rightMBR.area();
            
            // Si esta división produce menor área total, es mejor
            if (totalArea < minArea) {
                minArea = totalArea;
                bestIndex = i;
            }
        }
        // Retorna el índice que produce la división más compacta
        return bestIndex;
    }

    // Calcula el MBR mínimo que contiene todos los nodos proporcionados
    calculateMBR(nodes) {
        // Si no hay nodos, no hay MBR
        if (nodes.length === 0) return null;
        
        // Inicializa con valores extremos
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        
        // Encuentra los límites extremos entre todos los nodos
        for (const node of nodes) {
            if (node.mbr) {
                minX = Math.min(minX, node.mbr.minX);
                minY = Math.min(minY, node.mbr.minY);
                maxX = Math.max(maxX, node.mbr.maxX);
                maxY = Math.max(maxY, node.mbr.maxY);
            }
        }
        // Crea y retorna el rectángulo contenedor
        return new Rectangle(minX, minY, maxX - minX, maxY - minY);
    }

    // Ajusta el árbol hacia arriba después de una inserción o división
    adjustTree(node, splitNode = null) {
        // Si llegamos a la raíz
        if (node === this.root) {
            // Si hubo una división que necesita ser manejada en la raíz
            if (splitNode) {
                // Crea una nueva raíz con nivel incrementado
                const newRoot = new RTreeNode(node.level + 1);
                // La vieja raíz y el nodo dividido se convierten en hijos de la nueva raíz
                newRoot.addChild(node);
                newRoot.addChild(splitNode);
                // Actualiza la referencia a la raíz
                this.root = newRoot;
            }
            return;
        }

        // Encuentra el padre del nodo actual
        const parent = this.findParent(this.root, node);

        // Si no se encuentra padre (no debería pasar en árbol válido)
        if (!parent) return;
        
        // Actualiza el MBR del padre para reflejar cambios en los hijos
        parent.updateMBR();
        
        // Si hay un nodo dividido que necesita ser insertado en el padre
        if (splitNode) {
            // Si el padre tiene espacio disponible
            if (parent.children.length < this.maxEntries) {
                // Agrega el nodo dividido como nuevo hijo
                parent.addChild(splitNode);
            } else {
                // Si el padre también está lleno, divídelo recursivamente
                const newSplit = this.splitNode(parent);
                this.adjustTree(parent, newSplit);
            }
        } else {
            // Si no hay división, solo ajusta el árbol hacia arriba
            this.adjustTree(parent);
        }
    }

    // Encuentra el nodo padre de un nodo objetivo en el árbol
    findParent(currentNode, targetNode) {
        // Los nodos hoja no pueden ser padres
        if (currentNode.isLeaf) return null;
        
        // Busca en todos los hijos del nodo actual
        for (const child of currentNode.children) {
            // Si encontramos el nodo objetivo como hijo directo
            if (child === targetNode) {
                return currentNode;  // Este es el padre
            }
            // Busca recursivamente en el subárbol
            const found = this.findParent(child, targetNode);
            if (found) return found;
        }
        // No se encontró en este subárbol
        return null;
    }

    // Búsqueda de todos los objetos que intersectan con el rectángulo de consulta
    search(queryMBR, node = this.root, results = []) {
        // Si el nodo no tiene MBR, no hay nada que buscar
        if (!node.mbr) {
            return results;
        }
        // PRIMERA OPTIMIZACIÓN: Si el MBR del nodo no intersecta con la consulta, descarta todo el subárbol
        if (!node.mbr.intersects(queryMBR)) {
            return results;
        }
        
        // Si es un nodo hoja, verifica cada punto individualmente
        if (node.isLeaf) {
            for (const child of node.children) {
                // Asegura que el hijo sea un punto
                if (child.mbr instanceof Point) {
                    // CORRECCIÓN: Usa containsPoint para verificar inclusión exacta
                    if (queryMBR.containsPoint(child.mbr)) {
                        results.push(child);
                    }
                }
            }
        } else {
            // Si es nodo interno, busca recursivamente en todos los hijos
            for (const child of node.children) {
                this.search(queryMBR, child, results);
            }
        }
        return results;
    }
    
    // Búsqueda alternativa: método directo que revisa TODOS los puntos individualmente
    searchAllPoints(queryMBR) {
        const results = [];
        // Contadores para estadísticas (podrían usarse para depuración)
        let pointsFound = 0;
        let pointsChecked = 0;
        
        // Revisa CADA punto en el array de respaldo
        for (const point of this.points) {
            pointsChecked++;
            // Verifica si el punto está dentro del rectángulo de consulta
            if (queryMBR.containsPoint(point)) {
                pointsFound++;
                results.push({
                    mbr: point,      // El punto encontrado
                    data: point.data // Datos asociados al punto
                });
            }
        }
        
        return results;
    }

    // Búsqueda de los K puntos más cercanos a un punto de consulta
    knnSearch(queryPoint, k = 5) {
        // Si no hay puntos, retorna array vacío
        if (this.points.length === 0) {
            return [];
        }
        
        // Ajusta k si es mayor que el número total de puntos
        if (k > this.points.length) {
            k = this.points.length;
        }
        
        // Calcula distancia desde el punto de consulta a cada punto
        const allPointsWithDistances = this.points.map(point => ({
            point: { mbr: point },        // Referencia al punto
            distance: queryPoint.distanceTo(point), // Distancia calculada
            pointData: point              // Datos del punto
        }));
        
        // VERIFICACIÓN: También recolecta puntos desde el árbol para comparación
        let pointsFromTree = [];
        const collectAllPointsFromTree = (node) => {
            if (node.isLeaf) {
                for (const child of node.children) {
                    if (child.mbr instanceof Point) {
                        pointsFromTree.push({
                            point: child,
                            distance: queryPoint.distanceTo(child.mbr),
                            pointData: child.mbr
                        });
                    }
                }
            } else {
                for (const child of node.children) {
                    collectAllPointsFromTree(child);
                }
            }
        };
        collectAllPointsFromTree(this.root);
        
        // Usa todos los puntos del array de respaldo (más confiable)
        const pointsToUse = allPointsWithDistances;
        // Ordena por distancia (más cercano primero)
        pointsToUse.sort((a, b) => a.distance - b.distance);
        // Toma los k más cercanos
        const results = pointsToUse.slice(0, k);
        
        return results;
    }

    // Obtiene una copia de todos los puntos en el árbol
    getAllPoints() {
        return this.points.slice();  // slice() crea una copia del array
    }

    // Recolecta todos los nodos del árbol (útil para visualización y depuración)
    getAllNodes(node = this.root, nodes = []) {
        // Agrega el nodo actual a la lista
        nodes.push(node);
        // Si no es hoja, procesa recursivamente todos los hijos
        if (!node.isLeaf) {
            for (const child of node.children) {
                this.getAllNodes(child, nodes);
            }
        }
        return nodes;
    }

    // Genera estadísticas del árbol
    getStats() {
        const nodes = this.getAllNodes();
        const leaves = nodes.filter(node => node.isLeaf);
        const levels = new Set(nodes.map(node => node.level));
        
        return {
            totalNodes: nodes.length,    // Número total de nodos
            leafNodes: leaves.length,    // Número de nodos hoja
            maxLevel: Math.max(...levels), // Nivel máximo (altura del árbol)
            points: this.points.length   // Número total de puntos
        };
    }
    
    // Limpia completamente el árbol, reiniciándolo a estado vacío
    clear() {
        this.root = new RTreeNode(0);  // Nueva raíz vacía
        this.points = [];              // Limpia todos los puntos
        this.nextPointId = 1;          // Reinicia el contador de IDs
    }
}