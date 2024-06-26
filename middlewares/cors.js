import cors from 'cors'

const ACEEPTED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:1234',
  'http://localhost:3000',
  'http://localhost:8080',
  'https://mcv-front.web.app',
  'https://mcv-front.firebaseapp.com'
]

export const corsMiddleware = ({ acceptedOrigins = ACEEPTED_ORIGINS } = {}) =>
  cors({
    origin: (origin, callback) => {
      if (acceptedOrigins.includes(origin)) {
        return callback(null, true)
      }

      if (!origin) {
        return callback(null, true)
      }

      return callback(new Error('No almacenado en los CORS'))
    }
  })
