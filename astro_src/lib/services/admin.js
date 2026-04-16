import { ApiService } from './api';

/**
 * Service for administrative and AI training operations.
 */
export const ManualTrainingService = {
    /**
     * Fetches all weekly meal plans pending for manual validation/training.
     * Corresponds to GET /admin/manual-training (ManualTrainingResponse)
     */
    getPlans: async (token) => {
        return ApiService.request('/admin/manual-training', {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },

    /**
     * Updates and validates a weekly meal plan for training logs.
     * Corresponds to POST /admin/manual-training (TrainingLogsWeekRequest)
     */
    updatePlan: async (payload, token) => {
        return ApiService.request('/admin/manual-training', {
            method: 'POST',
            body: payload,
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
    },
};
