const axios = require('axios');
const { WebhookLog } = require('../models');

/**
 * POST /api/webhooks/test
 * Envia evento de teste para o n8n
 */
const testWebhook = async (req, res) => {
  try {
    const webhookUrl = process.env.N8N_WEBHOOK_URL;
    if (!webhookUrl) {
      return res.status(400).json({ error: 'URL do webhook n8n não configurada.' });
    }

    const payload = {
      event: 'test',
      user: { id: req.user.id, name: req.user.name, email: req.user.email },
      message: 'Teste de integração FinançasPRO → n8n',
      timestamp: new Date().toISOString(),
    };

    const log = await WebhookLog.create({
      user_id: req.user.id,
      event_type: 'test',
      payload,
      status: 'pending',
    });

    try {
      await axios.post(webhookUrl, payload, { timeout: 5000 });
      await log.update({ status: 'sent', sent_at: new Date() });
      res.json({ message: 'Webhook enviado com sucesso.', log });
    } catch (webhookErr) {
      await log.update({ status: 'failed', error: webhookErr.message });
      res.status(502).json({ error: 'Falha ao enviar webhook.', details: webhookErr.message });
    }
  } catch (err) {
    console.error('Webhook error:', err.message);
    res.status(500).json({ error: 'Erro interno.' });
  }
};

/**
 * Função interna para disparar evento via n8n
 */
const dispatchWebhook = async (user_id, event_type, payload) => {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;
  if (!webhookUrl) return;

  const log = await WebhookLog.create({
    user_id,
    event_type,
    payload,
    status: 'pending',
  });

  try {
    await axios.post(webhookUrl, { event: event_type, ...payload }, { timeout: 5000 });
    await log.update({ status: 'sent', sent_at: new Date() });
  } catch (err) {
    await log.update({ status: 'failed', error: err.message });
  }
};

/**
 * GET /api/webhooks/logs
 */
const getLogs = async (req, res) => {
  try {
    const logs = await WebhookLog.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 50,
    });
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar logs.' });
  }
};

module.exports = { testWebhook, dispatchWebhook, getLogs };
