// Definición de la clase Rectangle (Rectángulo) que representa un área rectangular en un espacio 2D
class Rectangle {

    // Constructor que inicializa un nuevo rectángulo con posición y dimensiones
    constructor(x, y, width, height) {
        // Coordenada X de la esquina inferior izquierda del rectángulo
        this.x = x;
        // Coordenada Y de la esquina inferior izquierda del rectángulo
        this.y = y;
        // Ancho del rectángulo (puede ser positivo o negativo)
        this.width = width;
        // Alto del rectángulo (puede ser positivo o negativo)
        this.height = height;
        
        // NORMALIZACIÓN: Asegurar que el ancho sea siempre positivo
        // Si el ancho es negativo, ajustamos la posición X y hacemos el ancho positivo
        if (width < 0) {
            // Recalculamos la posición X para mantener las mismas coordenadas mínimas/máximas
            this.x = x + width;
            // Convertimos el ancho a positivo
            this.width = -width;
        }
        
        // NORMALIZACIÓN: Asegurar que el alto sea siempre positivo
        // Si el alto es negativo, ajustamos la posición Y y hacemos el alto positivo
        if (height < 0) {
            // Recalculamos la posición Y para mantener las mismas coordenadas mínimas/máximas
            this.y = y + height;
            // Convertimos el alto a positivo
            this.height = -height;
        }
    }

    // Propiedad calculada: coordenada X mínima (esquina izquierda)
    get minX() { return this.x; }
    
    // Propiedad calculada: coordenada Y mínima (esquina inferior)
    get minY() { return this.y; }
    
    // Propiedad calculada: coordenada X máxima (esquina derecha)
    get maxX() { return this.x + this.width; }
    
    // Propiedad calculada: coordenada Y máxima (esquina superior)
    get maxY() { return this.y + this.height; }

    // Calcula el área del rectángulo (ancho × alto)
    area() {
        return this.width * this.height;
    }

    // Verifica si este rectángulo intersecta (se solapa) con otro objeto geométrico
    intersects(other) {
        // Si el otro objeto es un Punto
        if (other instanceof Point) {
            // Un rectángulo intersecta con un punto si el punto está dentro del rectángulo
            return other.x >= this.minX && 
                   other.x <= this.maxX && 
                   other.y >= this.minY && 
                   other.y <= this.maxY;
        } 
        // Si el otro objeto es otro Rectángulo
        else if (other instanceof Rectangle) {
            // Dos rectángulos se intersectan si NO se cumple ninguna de estas condiciones:
            // - El otro rectángulo está completamente a la derecha de este
            // - El otro rectángulo está completamente a la izquierda de este  
            // - El otro rectángulo está completamente arriba de este
            // - El otro rectángulo está completamente abajo de este
            return !(other.minX > this.maxX || 
                     other.maxX < this.minX || 
                     other.minY > this.maxY ||
                     other.maxY < this.minY);
        }
        // Para cualquier otro tipo de objeto, no hay intersección
        return false;
    }
    
    // Verifica si este rectángulo contiene completamente a otro objeto
    contains(other) {
        // Si el otro objeto es un Punto
        if (other instanceof Point) {
            // Para un punto, "contener" es lo mismo que "intersectar"
            return this.intersects(other);
        } 
        // Si el otro objeto es un Rectángulo
        else if (other instanceof Rectangle) {
            // Un rectángulo contiene a otro si:
            // - Su lado izquierdo está más a la izquierda o igual
            // - Su lado derecho está más a la derecha o igual  
            // - Su lado inferior está más abajo o igual
            // - Su lado superior está más arriba o igual
            return this.minX <= other.minX &&
                   this.maxX >= other.maxX &&
                   this.minY <= other.minY &&
                   this.maxY >= other.maxY;
        }
        // Para cualquier otro tipo de objeto, no contiene
        return false;
    }

    // Crea un nuevo rectángulo que contiene tanto este rectángulo como otro objeto
    union(other) {
        // Encuentra la coordenada X más a la izquierda entre ambos
        const minX = Math.min(this.minX, other.minX);
        // Encuentra la coordenada Y más abajo entre ambos
        const minY = Math.min(this.minY, other.minY);
        // Encuentra la coordenada X más a la derecha entre ambos
        const maxX = Math.max(this.maxX, other.maxX);
        // Encuentra la coordenada Y más arriba entre ambos
        const maxY = Math.max(this.maxY, other.maxY);
        // Crea un nuevo rectángulo que engloba completamente ambos objetos
        return new Rectangle(minX, minY, maxX - minX, maxY - minY);
    }

    // Calcula cuánto área adicional se necesitaría para contener ambos objetos
    enlargement(other) {
        // Obtiene el rectángulo unión que contiene ambos objetos
        const unionRect = this.union(other);
        // Retorna la diferencia de área entre la unión y este rectángulo original
        return unionRect.area() - this.area();
    }

    // Compara si este rectángulo es exactamente igual a otro rectángulo
    equals(other) {
        return this.minX === other.minX &&
               this.minY === other.minY &&
               this.maxX === other.maxX &&
               this.maxY === other.maxY;
    }
    
    // Calcula la distancia mínima entre este rectángulo y un punto
    minDistanceTo(point) {
        // Calcula la distancia horizontal: 
        // - Si el punto está dentro del rectángulo en X, distancia = 0
        // - Si está a la izquierda: this.minX - point.x
        // - Si está a la derecha: point.x - this.maxX
        const dx = Math.max(this.minX - point.x, 0, point.x - this.maxX);
        
        // Calcula la distancia vertical:
        // - Si el punto está dentro del rectángulo en Y, distancia = 0  
        // - Si está abajo: this.minY - point.y
        // - Si está arriba: point.y - this.maxY
        const dy = Math.max(this.minY - point.y, 0, point.y - this.maxY);
        
        // Calcula la distancia euclidiana usando el teorema de Pitágoras
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    // Método específico para verificar si un punto está dentro del rectángulo
    containsPoint(point) {
        // Verifica que el punto esté dentro de los límites del rectángulo en ambos ejes
        return point.x >= this.minX && 
               point.x <= this.maxX && 
               point.y >= this.minY && 
               point.y <= this.maxY;
    }
}