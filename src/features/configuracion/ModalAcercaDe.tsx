import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface ModalAcercaDeProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ModalAcercaDe({ open, onOpenChange }: ModalAcercaDeProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Acerca de la aplicación</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 py-2">
          <p className="font-semibold text-lg">Callbell Tracker PRO</p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Aplicación desarrollada a medida para este cliente: se construyó siguiendo de forma puntual lo solicitado,
            cuidando el detalle en flujos y datos, e incorporando las funciones extra que el negocio fue necesitando
            para operar con comodidad y claridad.
          </p>
          <p className="text-sm pt-2 border-t">
            <span className="font-medium">Desarrollador:</span> Javier Orona
          </p>
          <p className="text-sm">
            <span className="font-medium">Correo:</span>{' '}
            <a
              href="mailto:jav.oro.qui@gmail.com"
              className="text-primary underline-offset-4 hover:underline"
            >
              jav.oro.qui@gmail.com
            </a>
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>Cerrar</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
