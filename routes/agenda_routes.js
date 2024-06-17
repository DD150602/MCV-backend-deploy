import { Router } from 'express'
import { AgendaController } from '../controllers/agenda_controller.js'
export const agendaRouter = Router()

agendaRouter.get('/', AgendaController.getAgenda)
agendaRouter.get('/:fechaCita/:idEmpleado', AgendaController.getAgenda)
agendaRouter.put('/delete/:id', AgendaController.updateAgenda)
