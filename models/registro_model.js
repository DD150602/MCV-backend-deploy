import connection from "./connection_database.js"
import "dotenv/config"
import bcrypt from "bcrypt"
import crypto from "crypto"
<<<<<<< HEAD
import Mailjet from "node-mailjet"
import { NoDataFound, NotFoundUser, DuplicateInfo, InfoAlreadyExisting, AccountAlreadyDisable, OccupiedSpace } from '../squemas/errors_squemas.js'

=======
import Mailjet from 'node-mailjet'
import { NoDataFound, NotFoundUser } from "../squemas/errors_squemas.js"
>>>>>>> 95e2bbdd2f835e08cfbd152116e0011679907da9

export class registroModel {
  static async registrar({ userCorreo, userPassword, userRol, userGenero }) {
    try {
      const secret = crypto.randomBytes(32).toString("hex")
      const [existingUser] = await connection.query(
        "SELECT * FROM usuarios WHERE correo_usuario = ?",
        [userCorreo]
      )
      if (existingUser.length > 0) {
        return { error: "El correo electrónico ya está en uso" }
      }
      const saltRounds = 10
      const encryPassword = await bcrypt.hash(userPassword, saltRounds)
      const [registro] = await connection.query(
        "INSERT INTO usuarios (correo_usuario, password_usuario, id_tipo_usuario, id_genero) VALUES (?, ?, ?, ?)",
        [userCorreo, encryPassword, userRol, userGenero]
      )
      const [validar] = await connection.query(
        "INSERT INTO verificacion_correo (fk_id_usuario , codigo_verificacion , correo_usuario) VALUES ((SELECT id_usuario FROM usuarios WHERE correo_usuario = ?), ? , ?) ",
        [userCorreo, secret, userCorreo]
      )

      return { success: true, secret: secret }
    } catch (err) {
      console.error("Error al registrar:", err)
      return { error: "Error interno del servidor" }
    }
  }

  static async enviarCorreo({ userCorreo, secret }) {
    const mailjetClient = Mailjet.apiConnect(
      '34538d099c891c567832df06c3604b5d',
      '90ae5d5f8d216c7842159b9af30b2280'
    );
    var str = userCorreo;
    var res = str.split("@");

    const request = mailjetClient.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "william.castano@ingenews.co",
            Name: "Verificacion de cuenta MCV",
          },
          To: [
            {
              Email: userCorreo,
              Name: "Hola" + res[0],
            },
          ],
          Subject: "Confirmacion de cuenta MCV",
          TextPart:
            "Hola" + res[0] + ", este es un correo de verificacion para confirmar tu cuenta en MCV puedes dar click en el link para confirmar tu cuenta en el siguiente enlace.",
          HTMLPart:
            '<h3>gracias por confiar en nosotros verifica tu cuenta aqui <a href="http://localhost:3000/verificar-cuenta?codigo_verificacion=' + secret + '">Verificacion MCV</a></h3>',
        },
      ],
    })
    try {
      const result = await request;
      console.log(result.body);
    } catch (err) {
      console.error(err.statusCode, err.message);
    }
  }

  static async registroClientes({
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
  }) {
    try {
      let idRegistro = null;

      if (id_usuario) {
        const [[idUsuario]] = await connection.query(`SELECT BIN_TO_UUID(id_usuario) id_usuario FROM usuarios WHERE correo_usuario = ?`, [id_usuario]);

        if (idUsuario) {
          idRegistro = idUsuario.id_usuario;
        }
      }

      const [registrosCl] = await connection.query("INSERT INTO clientes (numero_documento_cliente, id_tipo_documento, lugar_expedicion_documento, primer_nombre_cliente, segundo_nombre_cliente, primer_apellido_cliente, segundo_apellido_cliente, telefono_cliente, direccion_cliente, estado_cliente, id_usuario) VALUES (?,?,?,?,?,?,?,?,?,?,UUID_TO_BIN(?))",
        [numero_documento_cliente, id_tipo_documento, lugar_expedicion_documento, primer_nombre_cliente, segundo_nombre_cliente, primer_apellido_cliente, segundo_apellido_cliente, telefono_cliente, direccion_cliente, estado_cliente, idRegistro]
      );
      return { success: true };
    } catch (error) {
      console.error("Error al registrar:", error);
      return { error: "Error interno del servidor" };
    }
  }

<<<<<<< HEAD
  static async getExamenes(){
    try{
      const [tipoExamenes] = await connection.query(`SELECT * FROM examenes`)
      if (!tipoExamenes) throw new NoDataFound()
      if (tipoExamenes.length === 0) throw new NoDataFound()
      return (tipoExamenes)
    }catch(error){
      return (error)
    }
  }

  static async getCertificados(){
    try{
      const [tipoCertificados] = await connection.query(`SELECT * FROM certificados`)
      if(!tipoCertificados) throw new NoDataFound()
      if(tipoCertificados.length === 0) throw new NoDataFound()
      return(tipoCertificados)
    }catch (error){
      return (error)
=======

  static async eliminarCuenta({ correo_u }) {
    try {
      const [[userId]] = await connection.query(`SELECT BIN_TO_UUID(id_usuario) id_usuario FROM usuarios WHERE correo_usuario = ?`, [correo_u]);
      const { id_usuario } = userId;
      const [res] = await connection.query(`UPDATE usuarios SET estado_usuario = 0 WHERE id_usuario = UUID_TO_BIN(?)`, [id_usuario]);

      if (res.affectedRows === 0) {
        throw new NotFoundUser();
      }

      return res;
    } catch (error) {
      console.error("Error al elminar:", error)
      return error
    }

  }

  static async actualizarClientes({ contraseña, correo_usuario, id, ...data }) {
    try {
      const [[idUsuario]] = await connection.query(`SELECT BIN_TO_UUID(id_usuario) id_usuario FROM usuarios WHERE correo_usuario = ?`, [correo_usuario]);
      const { id_usuario: idRegistro } = idUsuario;

      const [res] = await connection.query(`UPDATE clientes SET ? WHERE id_usuario = UUID_TO_BIN(?)`, [data, idRegistro]);


      if (res.affectedRows === 0) {
        throw new NotFoundUser();
      }

      return { res };
    } catch (error) {
      console.error("Error al actualizar:", error)
      return error;
    }
  }

  static async verificacionCuentas({ codigo_verificacion }) {
    try {

      const [[existingVerification]] = await connection.query(`SELECT estado_verificacion FROM verificacion_correo WHERE codigo_verificacion = ?`, [codigo_verificacion]);

      if (existingVerification && existingVerification.estado_verificacion === 1) {
        throw new Error('El código de verificación ya ha sido utilizado.');
      }
      const [res] = await connection.query(`UPDATE verificacion_correo SET estado_verificacion = 1 WHERE codigo_verificacion = ?`, [codigo_verificacion]);
      if (res.affectedRows === 0) {
        throw new NotFoundUser();
      }
      const [[select]] = await connection.query(`SELECT correo_usuario FROM verificacion_correo WHERE codigo_verificacion = ?`, [codigo_verificacion]);
      const { correo_usuario: correo } = select;
      const [res2] = await connection.query(`UPDATE usuarios SET estado_usuario = 1, estado_verificacion_usuario = 1 WHERE correo_usuario = ?`, [correo]);
      return res;
    } catch (error) {
      console.error("Error al actualizar:", error)
      return error
>>>>>>> 95e2bbdd2f835e08cfbd152116e0011679907da9
    }
  }
}
