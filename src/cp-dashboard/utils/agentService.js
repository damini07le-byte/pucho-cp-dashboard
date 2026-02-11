/**
 * AgentService.js
 * Bridges the CP Dashboard with Pucho AI Studio workflows.
 */

const FLOW_CONFIG = {
    'call': { id: 'WF-VOICE', name: 'AI Voice Recovery', webhook: 'https://studio.pucho.ai/api/v1/webhooks/w5Ny98y5m9L0gYk0wvbXz/sync' },
    'whatsapp': { id: 'WF-WA', name: 'WhatsApp Recovery', webhook: 'https://studio.pucho.ai/api/v1/webhooks/w5Ny98y5m9L0gYk0wvbXz/sync' },
    'email': { id: 'WF-MAIL', name: 'Email Recovery', webhook: 'https://studio.pucho.ai/api/v1/webhooks/w5Ny98y5m9L0gYk0wvbXz/sync' },
    'bulk': { id: 'WF-BULK', name: 'Bulk Master Flow', webhook: 'https://studio.pucho.ai/api/v1/webhooks/w5Ny98y5m9L0gYk0wvbXz/sync' }
};

export const triggerAgentFlow = async (type, flowId, context = {}) => {
    const config = FLOW_CONFIG[type] || { id: flowId, name: 'Custom Flow', webhook: 'https://studio.pucho.ai/api/v1/webhooks/w5Ny98y5m9L0gYk0wvbXz/sync' };

    console.group(`[🚀 WEBHOOK TRIGGERED] ${config.name}`);
    console.log(`Payload Data:`, context);

    try {
        const response = await fetch(config.webhook, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                action_type: type,
                customer_data: context,
                source: 'CP_Dashboard',
                triggered_at: new Date().toISOString()
            })
        });

        if (!response.ok) {
            const errorMsg = await response.text();
            throw new Error(`Webhook Error: ${response.status} - ${errorMsg}`);
        }

        const result = await response.json();
        console.log(`✅ Webhook Accepted:`, result);
        console.groupEnd();

        return {
            success: true,
            message: `${config.name} initiated successfully`,
            executionId: result.id || `EXEC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        };
    } catch (error) {
        console.error(`❌ Connection Failed:`, error.message);
        console.groupEnd();
        throw error;
    }
};
