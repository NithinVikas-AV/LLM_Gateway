import axios from 'axios'

const API_URL = typeof process !== 'undefined' && process.env.NODE_ENV === 'production'
  ? 'https://llmgateway-production.up.railway.app'
  : ''

export const chatWithGateway = (universalKey, model, messages) =>
  axios.post(`${API_URL}/gateway/chat`, { model, messages }, {
    headers: { 'x-api-key': universalKey }
  })