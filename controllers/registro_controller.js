import { registroModel } from "../models/registro_model.js"
import connection from "../models/connection_database.js"
import { NoDataFound, NotFoundUser, DuplicateInfo, InfoAlreadyExisting, AccountAlreadyDisable, OccupiedSpace } from '../squemas/errors_squemas.js'
import { query } from "express"

export class RegistroController {
  static async registro(req, res) {
    const { userCorreo, userPassword, userGenero, userRol } = req.body
    try {
      const response = await registroModel.registrar({
        userCorreo,
        userPassword,
        userGenero,
        userRol,
      })

      if (response.error) {
        res.status(400).json({ error: response.error })
      } else {
        res.status(201).json({ message: "Registro exitoso" })
        registroModel.enviarCorreo({ userCorreo })
      }
    } catch (error) {
      console.error("Error al registrar:", error)
      res.status(500).json({ message: "Error interno del servidor" })
    }
  }

  static async registroCliente(req, res) {
    const {
      numero_documento_cliente,
      id_tipo_documento,
      lugar_expedicion_documento,
      primer_nombre_cliente,
      segundo_nombre_cliente,
      primer_apellido_cliente,
      segundo_apellido_cliente,
      telefono_cliente,
      direccion_cliente,
      estado_cliente,
      id_usuario,
    } = req.body
    console.log(req.body)
    try {
      const respuesta = await registroModel.registroClientes({
        numero_documento_cliente,
        id_tipo_documento,
        lugar_expedicion_documento,
        primer_nombre_cliente,
        segundo_nombre_cliente,
        primer_apellido_cliente,
        segundo_apellido_cliente,
        telefono_cliente,
        direccion_cliente,
        estado_cliente,
        id_usuario,
      })

      if (respuesta.error) {
        res.status(400).json({ error: response.error })
      } else {
        res.status(201).json({ message: "Registro de cliente exitoso" })
      }
    } catch (error) {
      console.error("Error al registrar:", error)
      res.status(500).json({ message: "Error interno del servidor" })
    }
  }

  static async genero(req, res) {
    try {
      const query = ` SELECT * FROM genero`
      const [generos] = await connection.query(query)
      res.json(generos)
    } catch (error) {
      res.status(500).json({ message: "Error interno del servidor" })
    }
  }

  static async getDocumento(req, res) {
    try {
      const documento = `SELECT * FROM tipo_documento`
      const [doc] = await connection.query(documento)
      res.json(doc)
    } catch (error) {
      console.error("Error al obtener los generos:", error)
      res.status(500).json({ message: "Error interno del servidor" })
    }
  }

  static async getExamen(req, res){
    const response = await registroModel.getExamenes()
    if (response instanceof NoDataFound) {
      res.status(404).json({ message: 'No se encuentran los examenes' })
    } else if (response instanceof Error) {
      res.status(500).json({ message: 'Error interno del servidor' })
    } else {
      res.json(response)
    }
  }
  static async getCertificado(req, res){
    const response = await registroModel.getCertificados()
    if (response instanceof NoDataFound){
      res.status(404).json({message: 'No se encuentran los certificados'})
    }else if (response instanceof Error){
      res.status(500).json({message: 'Error interno del servidor'})
    }else{
      res.json(response)
    }
  }


  // se hizo todo el metodo de registro
}
