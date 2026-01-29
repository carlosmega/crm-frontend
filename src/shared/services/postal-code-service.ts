/**
 * Postal Code Service - Zippopotam API Integration
 *
 * Servicio para consultar códigos postales de México usando la API gratuita de Zippopotam.
 * API: https://api.zippopotam.us/
 *
 * 100% gratuita, sin límites, sin registro requerido.
 */

export interface PostalCodeInfo {
  /** Nombre del asentamiento/colonia */
  asentamiento: string
  /** Tipo de asentamiento (Colonia, Barrio, Unidad Habitacional, etc.) */
  tipoAsentamiento: string
  /** Municipio o delegación */
  municipio: string
  /** Estado */
  estado: string
  /** Ciudad (puede estar vacío) */
  ciudad: string
  /** Código postal */
  codigoPostal: string
  /** País */
  pais: string
}

export interface PostalCodeResponse {
  success: boolean
  data: PostalCodeInfo[]
  error?: string
}

// API de Zippopotam - gratuita y sin límites
const ZIPPOPOTAM_BASE_URL = 'https://api.zippopotam.us'

// Mapeo de abreviaciones de estado a nombres completos
const STATE_NAMES: Record<string, string> = {
  'AGU': 'Aguascalientes',
  'BCN': 'Baja California',
  'BCS': 'Baja California Sur',
  'CAM': 'Campeche',
  'CHP': 'Chiapas',
  'CHH': 'Chihuahua',
  'COA': 'Coahuila',
  'COL': 'Colima',
  'DIF': 'Ciudad de México',
  'DUR': 'Durango',
  'GUA': 'Guanajuato',
  'GRO': 'Guerrero',
  'HID': 'Hidalgo',
  'JAL': 'Jalisco',
  'MEX': 'Estado de México',
  'MIC': 'Michoacán',
  'MOR': 'Morelos',
  'NAY': 'Nayarit',
  'NLE': 'Nuevo León',
  'OAX': 'Oaxaca',
  'PUE': 'Puebla',
  'QUE': 'Querétaro',
  'ROO': 'Quintana Roo',
  'SLP': 'San Luis Potosí',
  'SIN': 'Sinaloa',
  'SON': 'Sonora',
  'TAB': 'Tabasco',
  'TAM': 'Tamaulipas',
  'TLA': 'Tlaxcala',
  'VER': 'Veracruz',
  'YUC': 'Yucatán',
  'ZAC': 'Zacatecas',
  // Nombres antiguos
  'Distrito Federal': 'Ciudad de México',
}

/**
 * Consulta información de un código postal mexicano
 * @param postalCode - Código postal de 5 dígitos
 * @returns Información del código postal con todas las colonias disponibles
 */
export async function lookupPostalCode(postalCode: string): Promise<PostalCodeResponse> {
  // Validar formato del código postal
  const cleanCode = postalCode.trim()
  if (!/^\d{5}$/.test(cleanCode)) {
    return {
      success: false,
      data: [],
      error: 'El código postal debe tener 5 dígitos'
    }
  }

  try {
    const response = await fetch(
      `${ZIPPOPOTAM_BASE_URL}/mx/${cleanCode}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!response.ok) {
      if (response.status === 404) {
        return {
          success: false,
          data: [],
          error: 'Código postal no encontrado'
        }
      }
      throw new Error(`HTTP ${response.status}`)
    }

    const result = await response.json()

    // Zippopotam devuelve: { country, "post code", places: [{ "place name", state, "state abbreviation" }] }
    if (!result.places || result.places.length === 0) {
      return {
        success: false,
        data: [],
        error: 'Código postal no encontrado'
      }
    }

    // Mapear la respuesta de Zippopotam a nuestra estructura
    const colonias: PostalCodeInfo[] = result.places.map((place: {
      'place name': string
      state: string
      'state abbreviation': string
    }) => {
      // Normalizar el nombre del estado
      const stateAbbr = place['state abbreviation']
      const stateName = STATE_NAMES[stateAbbr] || STATE_NAMES[place.state] || place.state

      return {
        asentamiento: place['place name'],
        tipoAsentamiento: 'Colonia', // Zippopotam no proporciona tipo
        municipio: place['place name'], // Usar colonia como municipio (limitación de la API)
        estado: stateName,
        ciudad: '', // Zippopotam no proporciona ciudad separada
        codigoPostal: result['post code'],
        pais: result.country || 'México'
      }
    })

    return {
      success: true,
      data: colonias
    }
  } catch (error) {
    console.error('Error consultando código postal:', error)
    return {
      success: false,
      data: [],
      error: 'Error de conexión con el servicio de códigos postales'
    }
  }
}

/**
 * Verifica si un código postal tiene el formato válido para México (5 dígitos)
 */
export function isValidMexicanPostalCode(postalCode: string): boolean {
  return /^\d{5}$/.test(postalCode.trim())
}
