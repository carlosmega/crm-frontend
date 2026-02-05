# Django: Quote Versioning en Endpoints de Productos

## Contexto

El frontend delegaba la creacion de "version snapshots" (historial de cambios) al cliente. Esto generaba **7 API calls por cada producto agregado/editado/eliminado**:

```
POST   /quotes/{id}/details        <- guardar producto
GET    /quotes/{id}                <- re-fetch quote (invalidacion cache)
GET    /quotes/{id}/details        <- re-fetch lineas (invalidacion cache)
GET    /quotes/{id}                <- snapshot: re-fetch quote OTRA VEZ
GET    /quotes/{id}/details        <- snapshot: re-fetch lineas OTRA VEZ
POST   /quote-versions             <- snapshot: guardar version
GET    /quote-versions?quoteId=... <- re-fetch versiones (invalidacion cache)
```

**Ahora el frontend solo hace 3 calls:**

```
POST   /quotes/{id}/details        <- guardar producto (Django crea snapshot internamente)
GET    /quotes/{id}                <- re-fetch quote con totales actualizados
GET    /quotes/{id}/details        <- re-fetch lineas
```

---

## Que debe hacer Django

### 1. Crear version snapshot automaticamente en los endpoints de productos

Cada vez que se ejecute un **POST**, **PATCH** o **DELETE** de un quote detail (linea de producto), Django debe:

1. Ejecutar la operacion (crear/editar/eliminar la linea)
2. Recalcular los totales de la quote (`totalamount`, `totaltax`, `totaldiscountamount`, etc.)
3. **Crear un registro de version snapshot** con el estado actual de la quote

### 2. Endpoints afectados

| Endpoint | Metodo | Accion de Snapshot |
|----------|--------|--------------------|
| `/quotes/{id}/details` | POST | Crear snapshot tipo `product_added` |
| `/quotes/details/{id}` | PATCH | Crear snapshot tipo `product_updated` |
| `/quotes/details/{id}` | DELETE | Crear snapshot tipo `product_removed` |

### 3. Modelo de QuoteVersion (nuevo o existente)

```python
class QuoteVersion(models.Model):
    """
    Snapshot del estado de una cotizacion en un momento dado.
    Se crea automaticamente cuando cambian los productos.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    quote = models.ForeignKey('Quote', on_delete=models.CASCADE, related_name='versions')

    # Numero de version (auto-incremental por quote)
    version_number = models.PositiveIntegerField()

    # Tipo de cambio que genero esta version
    CHANGE_TYPES = [
        ('product_added', 'Product Added'),
        ('product_updated', 'Product Updated'),
        ('product_removed', 'Product Removed'),
        ('quote_updated', 'Quote Updated'),
        ('status_changed', 'Status Changed'),
    ]
    change_type = models.CharField(max_length=30, choices=CHANGE_TYPES)

    # Descripcion legible del cambio
    change_description = models.CharField(max_length=500)
    # Ej: "Added product: Laptop HP ProBook 450"
    # Ej: "Updated product: Mouse Logitech MX (quantity: 2 -> 5)"
    # Ej: "Removed product: Cable HDMI"

    # Snapshot de los datos de la quote al momento del cambio
    snapshot_data = models.JSONField()
    # Estructura del JSON:
    # {
    #   "name": "QUO-2024-001",
    #   "totalamount": 15000.00,
    #   "totaltax": 2400.00,
    #   "totaldiscountamount": 500.00,
    #   "totallineitemamount": 13100.00,
    #   "statecode": 0,
    #   "statuscode": 1,
    #   "lines": [
    #     {
    #       "quotedetailid": "uuid",
    #       "productdescription": "Laptop HP",
    #       "quantity": 2,
    #       "priceperunit": 7500.00,
    #       "manualdiscountamount": 500.00,
    #       "tax": 2320.00,
    #       "extendedamount": 16820.00
    #     }
    #   ]
    # }

    # Campos que cambiaron (para highlight en UI)
    changed_fields = models.JSONField(default=list, blank=True)
    # Ej: ["products", "totalamount"]

    # Auditoria
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True
    )
    created_on = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-version_number']
        unique_together = ['quote', 'version_number']
```

### 4. Logica en los ViewSets / Serializers

```python
# En el ViewSet de QuoteDetail (lineas de producto):

class QuoteDetailViewSet(viewsets.ModelViewSet):

    def perform_create(self, serializer):
        """POST /quotes/{id}/details"""
        detail = serializer.save()

        # 1. Recalcular totales de la quote
        detail.quote.recalculate_totals()

        # 2. Crear version snapshot
        self._create_version_snapshot(
            quote=detail.quote,
            change_type='product_added',
            description=f'Added product: {detail.productdescription}',
            changed_fields=['products', 'totalamount']
        )

    def perform_update(self, serializer):
        """PATCH /quotes/details/{id}"""
        detail = serializer.save()

        detail.quote.recalculate_totals()

        self._create_version_snapshot(
            quote=detail.quote,
            change_type='product_updated',
            description=f'Updated product: {detail.productdescription}',
            changed_fields=['products', 'totalamount']
        )

    def perform_destroy(self, instance):
        """DELETE /quotes/details/{id}"""
        quote = instance.quote
        product_name = instance.productdescription

        instance.delete()

        quote.recalculate_totals()

        self._create_version_snapshot(
            quote=quote,
            change_type='product_removed',
            description=f'Removed product: {product_name}',
            changed_fields=['products', 'totalamount']
        )

    def _create_version_snapshot(self, quote, change_type, description, changed_fields):
        """Crear snapshot del estado actual de la quote."""
        # Obtener el siguiente numero de version
        last_version = QuoteVersion.objects.filter(
            quote=quote
        ).order_by('-version_number').first()

        next_version = (last_version.version_number + 1) if last_version else 1

        # Obtener todas las lineas actuales
        lines = quote.details.all().values(
            'quotedetailid', 'productdescription', 'quantity',
            'priceperunit', 'manualdiscountamount', 'tax',
            'baseamount', 'extendedamount'
        )

        # Construir snapshot
        snapshot_data = {
            'name': quote.name,
            'totalamount': float(quote.totalamount),
            'totaltax': float(quote.totaltax or 0),
            'totaldiscountamount': float(quote.totaldiscountamount or 0),
            'totallineitemamount': float(quote.totallineitemamount or 0),
            'statecode': quote.statecode,
            'statuscode': quote.statuscode,
            'lines': list(lines),
        }

        QuoteVersion.objects.create(
            quote=quote,
            version_number=next_version,
            change_type=change_type,
            change_description=description,
            snapshot_data=snapshot_data,
            changed_fields=changed_fields,
            created_by=self.request.user if self.request.user.is_authenticated else None,
        )
```

### 5. Endpoint para consultar versiones

El frontend ya consulta las versiones en la pestana "Versions". Django necesita exponer:

```
GET /quotes/{id}/versions
```

**Response:**
```json
[
  {
    "id": "uuid",
    "version_number": 3,
    "change_type": "product_added",
    "change_description": "Added product: Laptop HP ProBook 450",
    "snapshot_data": { ... },
    "changed_fields": ["products", "totalamount"],
    "created_by": "user-uuid",
    "created_on": "2025-01-15T10:30:00Z"
  },
  {
    "id": "uuid",
    "version_number": 2,
    "change_type": "product_updated",
    "change_description": "Updated product: Mouse Logitech MX",
    "snapshot_data": { ... },
    "changed_fields": ["products", "totalamount"],
    "created_by": "user-uuid",
    "created_on": "2025-01-15T10:25:00Z"
  }
]
```

---

## Resumen de cambios

### Frontend (YA HECHO)
- `use-quote-details.ts`: Eliminada toda la logica de `createProductVersionSnapshot`
- Las mutaciones (create, update, delete) solo hacen el API call + invalidan cache de quote y lineas
- De **7 calls** por operacion a **3 calls** (1 mutacion + 2 re-fetches)

### Backend (POR HACER)
1. Crear modelo `QuoteVersion` (o adaptar el existente)
2. En `perform_create`, `perform_update`, `perform_destroy` del ViewSet de QuoteDetail:
   - Recalcular totales de la quote
   - Crear version snapshot automaticamente
3. Exponer `GET /quotes/{id}/versions` para la pestana de versiones en el frontend

### Beneficio
- Menos trafico de red (de 7 a 3 requests por operacion)
- Snapshots mas confiables (el backend siempre tiene el estado real)
- El frontend no necesita re-fetchear datos solo para construir el snapshot
- Preparado para concurrencia (si 2 usuarios editan la misma quote, cada snapshot es atomico)
