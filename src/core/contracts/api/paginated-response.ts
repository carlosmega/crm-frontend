/**
 * Paginated Response (Django REST Framework)
 *
 * Formato de respuesta paginada estándar de Django REST Framework.
 *
 * Ejemplo:
 * ```json
 * {
 *   "count": 150,
 *   "next": "http://api.example.com/leads/?page=3",
 *   "previous": "http://api.example.com/leads/?page=1",
 *   "results": [...]
 * }
 * ```
 */
export interface PaginatedResponse<T> {
  count: number;                        // Total de registros
  next: string | null;                  // URL de la siguiente página (null si es la última)
  previous: string | null;              // URL de la página anterior (null si es la primera)
  results: T[];                         // Datos de la página actual
}

/**
 * Pagination Params
 *
 * Parámetros de query para paginación
 */
export interface PaginationParams {
  page?: number;                        // Número de página (default: 1)
  page_size?: number;                   // Tamaño de página (default: 20)
  ordering?: string;                    // Campo para ordenar (ej: "-createdon", "name")
  search?: string;                      // Búsqueda por texto
}

/**
 * Pagination Metadata
 *
 * Metadata de paginación útil para UI
 */
export interface PaginationMetadata {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Helper para extraer metadata de PaginatedResponse
 */
export function extractPaginationMetadata<T>(
  response: PaginatedResponse<T>,
  currentPage: number,
  pageSize: number
): PaginationMetadata {
  const totalPages = Math.ceil(response.count / pageSize);

  return {
    currentPage,
    pageSize,
    totalItems: response.count,
    totalPages,
    hasNext: response.next !== null,
    hasPrevious: response.previous !== null
  };
}
