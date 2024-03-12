import connection from './connection_database.js'
import { NoDataFound, NotFoundUser, AccountAlreadyDisable } from '../squemas/errors_squemas.js'

export class VacunasModel {
  static async getVacunas () {
    try {
      const [getVacunas] = await connection.query(`
      SELECT 
      BIN_TO_UUID(va.id_vacuna_aplicada) id, 
      va.fecha_vacuna_aplicada, 
      va.fecha_vencimiento_vacuna_aplicada, 
      va.laboratorio, 
      va.lote_vacuna_aplicada, 
      va.estado_vacuna_aplicada,
      m.nombre_mascota, 
      tm.tipo_mascota, 
      tv.nombre_vacuna,
      primer_nombre_cliente,
      primer_apellido_cliente
      FROM 
        vacunas_aplicadas va
        INNER JOIN 
        mascotas m ON va.id_mascota = m.id_mascota
        INNER JOIN 
        tipo_mascota tm ON m.id_tipo_mascota = tm.id_tipo_mascota
        INNER JOIN 
        tipo_vacuna tv ON va.id_tipo_vacuna = tv.id_tipo_vacuna
        INNER JOIN 
        clientes on m.id_cliente_mascota  = clientes.id_cliente  
        WHERE estado_vacuna_aplicada = 1  
        ;
  
      `)
      if (!getVacunas) throw new NoDataFound()
      return (getVacunas)
    } catch (error) {
      console.log(error)
      return (error)
    }
  }

  static async getTipoVacuna () {
    try {
      const [response] = await connection.query(`
        SELECT id_tipo_vacuna as id , nombre_vacuna as value , id_tipo_mascota
        FROM tipo_vacuna`)
      return response
    } catch (error) {
      console.log(error)
    }
  }

  static async vacunaAplicadaId ({ id }) {
    try {
      const [[getTipoVacunas]] = await connection.query(`
      SELECT 
    BIN_TO_UUID(va.id_vacuna_aplicada) id,
    va.fecha_vacuna_aplicada,
    va.fecha_vencimiento_vacuna_aplicada,
    va.laboratorio,
    va.lote_vacuna_aplicada,
    va.estado_vacuna_aplicada,
    m.nombre_mascota,
    tm.tipo_mascota,
    tv.nombre_vacuna,
    c.id_tipo_documento,
    c.numero_documento_cliente
FROM 
    vacunas_aplicadas va
INNER JOIN 
    mascotas m ON va.id_mascota = m.id_mascota
INNER JOIN 
    tipo_mascota tm ON m.id_tipo_mascota = tm.id_tipo_mascota
INNER JOIN 
    tipo_vacuna tv ON va.id_tipo_vacuna = tv.id_tipo_vacuna
INNER JOIN 
    clientes c ON m.id_cliente_mascota = c.id_cliente
WHERE id_vacuna_aplicada = UUID_TO_BIN(?)
;
      `, [id])
      if (!getTipoVacunas) throw new NoDataFound()
      return (getTipoVacunas)
    } catch (error) {
      console.log(error)
      return (error)
    }
  }

  static async createVacunas ({ input }) {
    const { fechaVacunaAplicada, fechaVencimiento, laboratorio, loteVacuna, idMascota, idTipoVacuna } = input
    try {
      const [response] = await connection.query(`
      INSERT INTO vacunas_aplicadas (fecha_vacuna_aplicada, fecha_vencimiento_vacuna_aplicada, laboratorio, lote_vacuna_aplicada, estado_vacuna_aplicada, id_mascota, id_tipo_vacuna)
      VALUES (?, ?, ?, ?, 1, UUID_TO_BIN(?), ?);`, [fechaVacunaAplicada, fechaVencimiento, laboratorio, loteVacuna, idMascota, idTipoVacuna])
      return response
    } catch (error) {
      console.log(error)
      return (error)
    }
  }

  static async updateVacuna ({ id, input }) {
    const { fechaVacunaAplicada } = input
    try {
      const response = await connection.query(`
        UPDATE vacunas_aplicadas
        SET fecha_vacuna_aplicada = ?
        WHERE  id_vacuna_aplicada =  UUID_TO_BIN(?);
      `, [fechaVacunaAplicada, id])

      return response
    } catch (error) {
      console.log(error)
      return error
    }
  }

  static async deleteVacuna ({ id, input }) {
    try {
      const { anotacion } = input

      const [[estadoVacuna]] = await connection.query('SELECT estado_vacuna_aplicada FROM vacunas_aplicadas WHERE id_vacuna_aplicada = UUID_TO_BIN(?)', [id])

      if (!estadoVacuna) throw new NotFoundUser()
      if (estadoVacuna.estado_vacuna_aplicada !== 1) throw new AccountAlreadyDisable()
      const [res] = await connection.query('UPDATE vacunas_aplicadas SET estado_vacuna_aplicada = 0, anotacion_vacuna_aplicada = ? WHERE id_vacuna_aplicada = UUID_TO_BIN(?)', [anotacion, id])

      return res
    } catch (err) {
      console.log('este es tu papa :', err)
      return err
    }
  }
}
