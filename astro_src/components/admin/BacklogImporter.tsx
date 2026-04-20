import React, { useState, useEffect } from 'react';
import { BacklogService } from '@/lib/services/admin';
import { translations } from '@context/SettingsContext';

const CATEGORY_MAP: Record<string, string> = {
    // --- Mapeos Descriptivos ---
    'Verduras y Guarniciones': 'SIDE_VEGETABLE',
    'Cereales y Tubérculos': 'SIDE_CARB',
    'Plato fuerte': 'MAIN_COURSE',
    'Leguminosas': 'LEGUME',
    'Salsas y aderezos': 'SAUCE',
    'Sopas y Caldos': 'SOUP',
    
    // --- Enums directos para evitar errores ---
    'BREAKFAST': 'BREAKFAST',
    'LUNCH': 'LUNCH',
    'DINNER': 'DINNER',
    'MAIN_COURSE': 'MAIN_COURSE',
    'SIDE_VEGETABLE': 'SIDE_VEGETABLE',
    'SIDE_CARB': 'SIDE_CARB',
    'LEGUME': 'LEGUME',
    'SNACK': 'SNACK',
    'SAUCE': 'SAUCE',
    'SOUP': 'SOUP'
};

export const BacklogImporter: React.FC = () => {
    const [jsonInput, setJsonInput] = useState('');
    const [transformedData, setTransformedData] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Auto-transform on input change
    useEffect(() => {
        if (!jsonInput.trim()) {
            setTransformedData(null);
            setError(null);
            return;
        }

        // Only clear success message if the user is actually typing something new
        setSuccessMessage(null);

        try {
            const rawData = JSON.parse(jsonInput);
            const items = Array.isArray(rawData) ? rawData : (rawData.items || []);

            if (!Array.isArray(items)) {
                throw new Error('Input must be an array of objects or an object with an "items" array.');
            }

            const mappedItems = items.map((item: any) => ({
                title: item.title,
                categoryHint: CATEGORY_MAP[item.category] || item.categoryHint || item.category || 'UNKNOWN'
            }));

            setTransformedData({ items: mappedItems });
            setError(null);
        } catch (e: any) {
            setError(e.message || 'Invalid JSON format');
            setTransformedData(null);
        }
    }, [jsonInput]);

    const handleUpload = async () => {
        if (!transformedData) return;

        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await BacklogService.bulkUpload(transformedData);
            setSuccessMessage(response?.message || 'Backlog items uploaded successfully!');
            setJsonInput('');
        } catch (e: any) {
            setError(e.message || 'Failed to upload backlog items');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Bulk Backlog Importer</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
                    Paste a JSON list of recipes. The system will automatically wrap them in an <code className="bg-slate-100 dark:bg-slate-800 px-1 rounded">items</code> array and map categories to backend hints.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Raw JSON Input (List of items)
                        </label>
                        <textarea
                            value={jsonInput}
                            onChange={(e) => setJsonInput(e.target.value)}
                            placeholder='[{"title": "Recipe Name", "category": "Verduras y Guarniciones"}]'
                            className="w-full h-64 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                        />
                    </div>

                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                            <span>{error}</span>
                        </div>
                    )}

                    {successMessage && (
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-600 dark:text-green-400 text-sm flex items-start gap-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                            <span>{successMessage}</span>
                        </div>
                    )}

                    <button
                        onClick={handleUpload}
                        disabled={!transformedData || loading}
                        className={`w-full py-3 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                            !transformedData || loading
                                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20'
                        }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Sending...
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                                Upload to Backlog
                            </>
                        )}
                    </button>
                </div>
            </div>

            {transformedData && (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4">Preview (Transformed Data)</h3>
                    <div className="max-h-96 overflow-y-auto font-mono text-xs p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                        <pre>{JSON.stringify(transformedData, null, 2)}</pre>
                    </div>
                </div>
            )}
        </div>
    );
};
