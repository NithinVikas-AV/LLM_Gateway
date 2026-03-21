import axios from 'axios'

const API_URL = import.meta.env.PROD
  ? 'https://llmgateway-production.up.railway.app'
  : ''

export const chatWithGateway = (universalKey, model, messages) =>
  axios.post(`${API_URL}/gateway/chat`, { model, messages }, {
    headers: { 'x-api-key': universalKey }
  })