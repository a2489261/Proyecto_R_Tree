// Definición de la clase Point (Punto) que representa un punto en un espacio 2D
class Point {
    // Constructor que inicializa un nuevo punto
    constructor(x, y, data = null) {
        // Coordenada X del punto
        this.x = x;
        // Coordenada Y del punto 
        this.y = y;
        // Datos adicionales opcionales que pueden asociarse al punto (como un identificador, información, etc.)
        this.data = data;
        // Ancho del punto (siempre 1 ya que es un punto sin dimensión)
        this.width = 1;
        // Alto del punto (siempre 1 ya que es un punto sin dimensión)
        this.height = 1;
        // Identificador único: usa el ID de los datos si existe, o genera uno aleatorio
        this.id = data?.id || Math.random().toString(36).substr(2, 9);
    }
    
    // Propiedad calculada: coordenada X mínima (para un punto, es simplemente su coordenada X)
    get minX() { return this.x; }
    
    // Propiedad calculada: coordenada Y mínima (para un punto, es simplemente su coordenada Y)
    get minY() { return this.y; }
    
    // Propiedad calculada: coordenada X máxima (para un punto, es X + ancho = X + 1)
    get maxX() { return this.x + this.width; }
    
    // Propiedad calculada: coordenada Y máxima (para un punto, es Y + alto = Y + 1)
    get maxY() { return this.y + this.height; }
    
    // Calcula el área del punto (siempre 1 ya que width y height son 1)
    area() { return this.width * this.height; }
    
    // Verifica si este punto intersecta (colisiona) con otro objeto geométrico
    intersects(other) {
        // Si el otro objeto es también un punto
        if (other instanceof Point) {
            // Dos puntos se intersectan solo si tienen exactamente las mismas coordenadas
            return this.x === other.x && this.y === other.y;
        } 
        // Si el otro objeto es un rectángulo
        else if (other instanceof Rectangle) {
            // Un punto intersecta con un rectángulo si está dentro de sus límites
            return this.x >= other.minX && 
                   this.x <= other.maxX && 
                   this.y >= other.minY && 
                   this.y <= other.maxY;
        }
        // Para cualquier otro tipo de objeto, no hay intersección
        return false;
    }
    
    // Verifica si este punto contiene completamente a otro objeto geométrico
    // NOTA: Esta implementación parece incorrecta para un punto, ya que un punto
    // no puede contener completamente a otro objeto a menos que sean el mismo punto
    contains(other) {
        return this.minX <= other.minX &&
               this.maxX >= other.maxX &&
               this.minY <= other.minY &&
               this.maxY >= other.maxY;
    }
    
    // Crea un rectángulo que contiene tanto este punto como otro objeto
    union(other) {
        // Encuentra las coordenadas mínimas y máximas entre ambos objetos
        const minX = Math.min(this.minX, other.minX);
        const minY = Math.min(this.minY, other.minY);
        const maxX = Math.max(this.maxX, other.maxX);
        const maxY = Math.max(this.maxY, other.maxY);
        // Retorna un nuevo rectángulo que engloba ambos objetos
        return new Rectangle(minX, minY, maxX - minX, maxY - minY);
    }
    
    // Calcula cuánto área se agregaría si uniéramos este punto con otro objeto
    enlargement(other) {
        // Crea la unión de ambos objetos
        const unionRect = this.union(other);
        // Retorna la diferencia de área entre la unión y este punto
        return unionRect.area() - this.area();
    }
    
    // Compara si este punto es igual a otro objeto geométrico
    equals(other) {
        return this.minX === other.minX &&
               this.minY === other.minY &&
               this.maxX === other.maxX &&
               this.maxY === other.maxY;
    }
    
    // Calcula la distancia euclidiana entre este punto y otro punto
    distanceTo(other) {
        // Diferencia en coordenadas X
        const dx = this.x - other.x;
        // Diferencia en coordenadas Y
        const dy = this.y - other.y;
        // Teorema de Pitágoras: √(dx² + dy²)
        return Math.sqrt(dx * dx + dy * dy);
    }
}