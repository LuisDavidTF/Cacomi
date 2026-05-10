import React, { useState } from 'react';
import { useSettings } from '@context/SettingsContext';
import { API_URL } from '@/lib/services/config';

type JobStatus = 'Running' | 'Idle' | 'Paused' | 'Failed';

type JobDefinition = {
    id: string;
    alias: string;
    name: string;
    description: string;
    endpointParams: string;
};

const ACTUAL_JOBS: JobDefinition[] = [
    { id: '1', alias: 'NutritionSyncJob', name: 'Nutrition Sync', description: 'Llena calorías/macros de ingredientes pendientes', endpointParams: '/sync-nutrition' },
    { id: '2', alias: 'PriceSyncJob', name: 'Price Sync', description: 'Actualiza precios de ingredientes en BD', endpointParams: '/sync-prices' },
    { id: '3', alias: 'RecipeNutritionJob', name: 'Recipe Nutrition Batch', description: 'Calcula macros totales en recetas pendientes', endpointParams: '/sync-nutrition-batch' },
    { id: '4', alias: 'RecipeImageJob', name: 'Image Generation', description: 'Genera imágenes diarias mediante Pollinations AI', endpointParams: '/trigger-image-generation' },
    { id: '5', alias: 'RecipeVectorSync', name: 'Vectorize Recipes', description: 'Genera vectores Embedding (Gemini) para búsqueda', endpointParams: '/vectorize-recipes' },
    { id: '6', alias: 'DailyRecipeGenerator', name: 'Daily Recipe Generator', description: 'Genera nuevas recetas (Gemini Normal)', endpointParams: '/generate-daily-recipes' },
    { id: '7', alias: 'ScavengerGenerator', name: 'Quota Recipe Generator', description: 'Genera recetas (Gemini 3 Scavenger)', endpointParams: '/generate-quota-recipes' },
    { id: '8', alias: 'TrainingJob', name: 'Training Bots', description: 'Genera datos de entrenamiento nocturno (PlannerTraining)', endpointParams: '/training-bots' }
];

export const JobsDataManager = () => {
    const { t } = useSettings();
    const [jobStatuses, setJobStatuses] = useState<Record<string, JobStatus>>({});
    const [isLoading, setIsLoading] = useState<string | null>(null);
    const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());

    const toggleJob = (id: string) => {
        setExpandedJobs(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleAction = async (job: JobDefinition, action: 'run' | 'pause' | 'resume') => {
        setIsLoading(job.id);
        
        let path = job.endpointParams;
        if (action === 'pause') path += '/pause';
        if (action === 'resume') path += '/resume';
        
        try {
            const headers: HeadersInit = {
                'Content-Type': 'application/json'
            };
            
            // Note: We rely on the BFF proxy to inject the auth_token from cookies.
            // No need to manually manage admin tokens in sessionStorage unless explicitly required.

            // Según la documentación de backend la ruta base debería ser /admin/jobs
            const url = `${API_URL}/admin/jobs${path}`;
            
            const res = await fetch(url, {
                method: 'POST',
                headers
                // Removed credentials: 'omit' to allow the auth_token cookie to be sent to the proxy
            });
            
            const text = await res.text();
            
            if (res.ok || res.status === 202) {
                setJobStatuses(prev => ({
                    ...prev,
                    [job.id]: action === 'pause' ? 'Paused' : 'Running'
                }));
                // Feedback visual breve opcional
                console.log(`Success [${job.name}]: ${text}`);
            } else {
                alert(`Error al ejecutar la acción: ${res.statusText}\n${text}`);
            }
        } catch (error: any) {
            console.error(error);
            alert(`Error de red al intentar conectar con el backend: ${error.message || 'Error desconocido'}`);
        } finally {
            setIsLoading(null);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">
                    {t.admin?.jobs || 'Background Jobs & AI Processes'}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Controla, pausa y reanuda manualmente los procesos asíncronos y robots de la plataforma.
                </p>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left block sm:table">
                    <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 hidden sm:table-header-group">
                        <tr>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-left">Job Name</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-left">Detalle</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-center">Status</th>
                            <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="block sm:table-row-group divide-y divide-slate-200 dark:divide-slate-800">
                        {ACTUAL_JOBS.map(job => {
                            const status = jobStatuses[job.id] || 'Idle';
                            const isActionLoading = isLoading === job.id;
                            const isExpanded = expandedJobs.has(job.id);

                            return (
                                <tr key={job.id} className="block sm:table-row hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors mb-6 sm:mb-0 border border-slate-200 dark:border-slate-800 sm:border-0 rounded-lg sm:rounded-none overflow-hidden">
                                    <td 
                                        onClick={() => toggleJob(job.id)}
                                        className="block sm:table-cell px-4 sm:px-6 py-3 sm:py-4 align-middle bg-slate-50/50 sm:bg-transparent dark:bg-slate-800/40 sm:dark:bg-transparent border-b sm:border-0 border-slate-200 dark:border-slate-800 cursor-pointer sm:cursor-auto"
                                    >
                                        <div className="flex justify-between items-center w-full">
                                            <div>
                                                <div className="font-medium text-slate-900 dark:text-slate-100 whitespace-nowrap">{job.name}</div>
                                                <div className="text-[10px] text-slate-500 font-mono mt-0.5">{job.alias}</div>
                                            </div>
                                            <div className="sm:hidden text-slate-400">
                                                <svg className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                    </td>
                                    <td className={`${isExpanded ? 'block' : 'hidden'} sm:table-cell px-4 sm:px-6 py-3 sm:py-4 align-middle text-slate-600 dark:text-slate-300 text-xs sm:text-balance border-b sm:border-0 border-slate-100 dark:border-slate-800/50`}>
                                        {job.description}
                                    </td>
                                    <td className={`${isExpanded ? 'flex' : 'hidden'} justify-between items-center sm:table-cell px-4 sm:px-6 py-3 sm:py-4 align-middle sm:text-center border-b sm:border-0 border-slate-100 dark:border-slate-800/50`}>
                                        <span className="sm:hidden font-semibold text-xs text-slate-500 dark:text-slate-400">Status</span>
                                        <div className="flex sm:justify-center">
                                            <span className={`inline-flex px-2 py-1 items-center justify-center rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap
                                                ${status === 'Running' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-400' : ''}
                                                ${status === 'Idle' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : ''}
                                                ${status === 'Paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-400' : ''}
                                                ${status === 'Failed' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : ''}
                                            `}>
                                                {status === 'Idle' ? 'En Horario' : status}
                                                {status === 'Running' && <span className="inline-block ml-1.5 w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>}
                                            </span>
                                        </div>
                                    </td>
                                    <td className={`${isExpanded ? 'flex' : 'hidden'} sm:table-cell flex-row sm:flex-col items-center justify-between px-4 sm:px-6 py-3 sm:py-4 text-right align-middle`}>
                                        <span className="sm:hidden font-semibold text-xs text-slate-500 dark:text-slate-400">Actions</span>
                                        <div className="flex flex-col sm:items-end gap-3 py-1">
                                            {/* Los 3 botones estarán siempre expuestos hasta tener el endpoint de status real */}
                                            <button 
                                                onClick={() => handleAction(job, 'run')}
                                                disabled={isActionLoading}
                                                title="Forzar ejecución ahora"
                                                className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium disabled:opacity-50 transition-colors whitespace-nowrap text-right"
                                            >
                                                Run Now
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleAction(job, 'resume')}
                                                disabled={isActionLoading}
                                                title="Reanudar ciclo en su próximo horario"
                                                className="text-emerald-600 hover:text-emerald-800 dark:text-emerald-500 dark:hover:text-emerald-400 font-medium disabled:opacity-50 transition-colors whitespace-nowrap text-right"
                                            >
                                                Resume
                                            </button>
                                            
                                            <button 
                                                onClick={() => handleAction(job, 'pause')}
                                                disabled={isActionLoading}
                                                title="Pausar el ciclo automático / Detener ejecución actual"
                                                className="text-amber-600 hover:text-amber-800 dark:text-amber-500 dark:hover:text-amber-400 font-medium disabled:opacity-50 transition-colors whitespace-nowrap text-right"
                                            >
                                                Pause
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
