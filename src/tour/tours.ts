import type { TourDefinition } from './types'

export const ACCOUNTS_TOUR: TourDefinition = {
  id: 'cuentas',
  title: 'Cuentas',
  description: 'Crear, seleccionar y transferir.',
  steps: [
    {
      target: 'accounts',
      title: 'Tus cuentas',
      description:
        'Cada tarjeta resume una cuenta con su saldo actual, calculado desde sus movimientos.',
      placement: 'bottom',
    },
    {
      target: 'new-account',
      title: 'Nueva cuenta',
      description:
        'Crea una cuenta y define su saldo inicial. Ese saldo queda registrado como un movimiento de apertura.',
      placement: 'bottom',
    },
    {
      target: 'account-card',
      title: 'Selecciona una cuenta',
      description:
        'Al pulsarla, Movimientos muestra solo esa cuenta, incluidas sus transferencias. Pulsa de nuevo o «Ver todas» para quitar el filtro.',
      placement: 'bottom',
    },
    {
      target: 'transfer',
      title: 'Transferir',
      description:
        'Mueve dinero entre dos cuentas de la misma moneda. El destino solo ofrece cuentas en la moneda del origen, porque no hay conversión.',
      placement: 'bottom',
    },
  ],
}

export const MOVEMENTS_TOUR: TourDefinition = {
  id: 'movimientos',
  title: 'Movimientos',
  description: 'Altas, facturas, edición y filtros.',
  steps: [
    {
      target: 'movements',
      title: 'Tus movimientos',
      description:
        'Los 50 más recientes de todas tus cuentas, o solo los de la cuenta que tengas seleccionada.',
      placement: 'bottom',
    },
    {
      target: 'movements-add',
      title: 'Agregar movimiento',
      description:
        'El menú ofrece dos caminos: alta manual, o «Desde una factura» para leerla desde una imagen o PDF.',
      placement: 'left',
    },
    {
      target: 'movements-list',
      title: 'Cada fila es editable',
      description:
        'Puedes editar descripción, fecha, categoría, comercio, notas y factura. El monto, el tipo y la cuenta no cambian para no perder la trazabilidad.',
      placement: 'top',
    },
  ],
}

export const MOVEMENT_FORM_TOUR: TourDefinition = {
  id: 'nuevo-movimiento',
  title: 'Nuevo movimiento',
  description: 'Cómo llenar el formulario.',
  steps: [
    {
      target: 'movement-type',
      title: 'Tipo de movimiento',
      description:
        'Elige gasto o ingreso. Para mover dinero entre cuentas usa el icono de transferir junto a Cuentas.',
      placement: 'bottom',
    },
    {
      target: 'movement-receipt',
      title: 'Factura (opcional)',
      description:
        'Adjunta una imagen o PDF. Se lee con OCR o IA según tu configuración y prellena los campos. Revísalos antes de guardar.',
      placement: 'bottom',
    },
    {
      target: 'movement-fields',
      title: 'Monto, fecha y descripción',
      description:
        'El monto debe ser mayor a 0. La categoría ayuda a ver tus gastos; si no existe, puedes crearla aquí mismo.',
      placement: 'bottom',
    },
    {
      target: 'movement-account',
      title: 'Cuenta',
      description:
        'Si seleccionaste una cuenta en la lista, aparece aquí bloqueada. Así el movimiento queda en la cuenta correcta.',
      placement: 'bottom',
    },
    {
      target: 'movement-submit',
      title: 'Guardar',
      description:
        'Al guardar, el movimiento cuenta en el saldo. Si cierras sin guardar, la factura adjunta se elimina.',
      placement: 'top',
    },
  ],
}

export const TRANSFER_TOUR: TourDefinition = {
  id: 'transferencias',
  title: 'Transferencias',
  description: 'Mover dinero entre cuentas.',
  steps: [
    {
      target: 'transfer-from',
      title: 'Cuenta de origen',
      description: 'De aquí sale el dinero. Cada opción muestra su moneda.',
      placement: 'bottom',
    },
    {
      target: 'transfer-to',
      title: 'Cuenta de destino',
      description:
        'Solo aparecen cuentas con la misma moneda que el origen. No hay conversión de moneda en esta versión.',
      placement: 'bottom',
    },
    {
      target: 'transfer-fields',
      title: 'Monto, fecha y descripción',
      description:
        'El monto debe ser mayor a 0. La descripción es opcional; si la dejas vacía se guarda como «Transferencia».',
      placement: 'bottom',
    },
    {
      target: 'transfer-submit',
      title: 'Transferir',
      description:
        'La transferencia aparece en ambas cuentas. El saldo total no cambia porque el dinero solo se mueve.',
      placement: 'top',
    },
  ],
}

export const SETTINGS_TOUR: TourDefinition = {
  id: 'configuracion',
  title: 'Configuración',
  description: 'Cómo se leen tus facturas.',
  steps: [
    {
      target: 'scanner-select',
      title: 'Lector de facturas',
      description:
        'Elige cómo se leen tus facturas: OCR en tu navegador, o inteligencia artificial de Gemini, que es más rápida.',
      placement: 'bottom',
    },
    {
      target: 'scanner-note',
      title: 'Privacidad',
      description:
        'Con OCR la imagen nunca sale de tu equipo. Con IA, la factura se envía a Google para leerla.',
      placement: 'top',
    },
  ],
}
