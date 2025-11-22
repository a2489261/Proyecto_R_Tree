// Definición de la clase RTreeNode (Nodo del R-Tree)
// Representa un nodo en la estructura jerárquica del R-Tree
class RTreeNode {

    // Constructor que inicializa un nuevo nodo del R-Tree
    constructor(level, mbr = null) {
        // Nivel del nodo en el árbol: 0 = hoja, >0 = nodo interno
        this.level = level;
        // MBR (Minimum Bounding Rectangle): rectángulo mínimo que contiene todos los hijos
        this.mbr = mbr;
        // Array que almacena los hijos de este nodo (pueden ser puntos u otros nodos)
        this.children = [];
        // Indica si este nodo es una hoja (nivel 0 contiene puntos directamente)
        this.isLeaf = level === 0;
        // Identificador único para este nodo (útil para depuración y seguimiento)
        this.nodeId = Math.random().toString(36).substr(2, 9);
    }

    // Agrega un nuevo hijo a este nodo
    addChild(child) {
        // Añade el hijo al final del array de hijos
        this.children.push(child);
        // Actualiza el MBR para que incluya el nuevo hijo
        this.updateMBR();
    }

    // Elimina un hijo existente de este nodo
    removeChild(child) {
        // Encuentra la posición del hijo en el array
        const index = this.children.indexOf(child);
        // Si se encontró el hijo (index > -1 significa que existe)
        if (index > -1) {
            // Elimina el hijo del array (1 elemento en la posición encontrada)
            this.children.splice(index, 1);
            // Actualiza el MBR para reflejar la eliminación
            this.updateMBR();
        }
    }

    // Actualiza el MBR (rectángulo contenedor) de este nodo
    updateMBR() {
        // Si el nodo no tiene hijos, no puede tener MBR
        if (this.children.length === 0) {
            this.mbr = null;
            return;
        }

        // Inicializa variables para encontrar los límites extremos
        // Comienza con valores infinitos para encontrar los mínimos/máximos reales
        let minX = Infinity,  // Inicia con el valor más grande posible
            minY = Infinity, 
            maxX = -Infinity, // Inicia con el valor más pequeño posible  
            maxY = -Infinity;
        
        // Recorre todos los hijos para encontrar los límites que los contengan a todos
        for (const child of this.children) {
            // Solo procesa hijos que tengan un MBR definido
            if (child.mbr) {
                // Actualiza la coordenada X mínima entre todos los hijos
                minX = Math.min(minX, child.mbr.minX);
                // Actualiza la coordenada Y mínima entre todos los hijos
                minY = Math.min(minY, child.mbr.minY);
                // Actualiza la coordenada X máxima entre todos los hijos
                maxX = Math.max(maxX, child.mbr.maxX);
                // Actualiza la coordenada Y máxima entre todos los hijos
                maxY = Math.max(maxY, child.mbr.maxY);
            }
        }
        
        // Crea un nuevo rectángulo que contiene a todos los hijos
        this.mbr = new Rectangle(minX, minY, maxX - minX, maxY - minY);
    }
    
    // Recupera todos los puntos contenidos en este nodo y sus subnodos
    getAllPoints() {
        // Array que almacenará todos los puntos encontrados
        const points = [];
        
        // Si este nodo es una hoja (contiene puntos directamente)
        if (this.isLeaf) {
            // Recorre todos los hijos del nodo hoja
            for (const child of this.children) {
                // Verifica que el hijo sea realmente un punto (no otro nodo)
                if (child.mbr instanceof Point) {
                    // Agrega el punto al array de resultados
                    points.push(child.mbr);
                }
            }
        } else {
            // Si es un nodo interno (no hoja), recorre recursivamente
            for (const child of this.children) {
                // Llama recursivamente a getAllPoints en cada hijo
                // y agrega todos los puntos resultantes al array
                points.push(...child.getAllPoints());
            }
        }
        
        // Retorna la colección completa de puntos
        return points;
    }
}