import React, { useState, useEffect } from 'react';
import { EyeIcon, XIcon } from '@components/ui/Icons';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [errorLine, setErrorLine] = useState<number | null>(null);
    const [errorPosition, setErrorPosition] = useState<number | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const gutterRef = React.useRef<HTMLDivElement>(null);
    const highlightRef = React.useRef<HTMLDivElement>(null);
    const decorationRef = React.useRef<HTMLDivElement>(null);

    const lineCount = jsonInput.split('\n').length;

    // Auto-transform on input change
    useEffect(() => {
        if (!jsonInput.trim()) {
            setTransformedData(null);
            setError(null);
            return;
        }

        // Clear success message when starting to type new data
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
            setErrorLine(null);
            setErrorPosition(null);
        } catch (e: any) {
            let msg = e.message || 'Error de formato JSON';
            let line: number | null = null;
            let pos: number | null = null;

            // 1. SMART HEURISTICS (Before relying on browser message)
            // Trailing Comma detection: , followed by closure
            const trailingCommaMatch = jsonInput.match(/,[\s\n]*[}\]]/);
            // Missing Comma detection: } followed by {
            const missingCommaMatch = jsonInput.match(/\}[ \n\t]*\{/);
            // Unbalanced detection
            const openBraces = (jsonInput.match(/{/g) || []).length;
            const closeBraces = (jsonInput.match(/}/g) || []).length;

            if (trailingCommaMatch) {
                msg = "Se encontró una coma sobrante antes de un cierre (}, o ],). El JSON estándar no permite comas al final.";
                pos = trailingCommaMatch.index! + 1; // Highlight the comma
            } else if (missingCommaMatch) {
                msg = "Falta una coma entre objetos del array.";
                pos = missingCommaMatch.index! + 1; // Highlight the closing brace of first object
            } else if (openBraces > closeBraces) {
                msg = "Falta cerrar una o más llaves '{'.";
                pos = jsonInput.lastIndexOf('{');
            } else if (closeBraces > openBraces) {
                msg = "Hay llaves '}' de cierre sobrantes.";
                pos = jsonInput.lastIndexOf('}');
            } else {
                // FALLBACK: Browser native position detection
                const positionMatch = msg.match(/at position (\d+)/);
                if (positionMatch) {
                    pos = parseInt(positionMatch[1], 10);
                } else {
                    const lineMatch = msg.match(/line (\d+)/);
                    if (lineMatch) {
                        line = parseInt(lineMatch[1], 10);
                    }
                }
            }

            // Sync line from position if not set
            if (pos !== null && line === null) {
                line = jsonInput.substring(0, pos).split('\n').length;
            }

            if (line) {
                setErrorLine(line);
                setErrorPosition(pos);
                setError(`[Línea ${line}] ${msg}`);
            } else {
                setError(msg);
                setErrorLine(null);
                setErrorPosition(null);
            }
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

    const PreviewContent = () => (
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-full flex flex-col">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Preview (Transformed Data)</span>
                {transformedData?.items && (
                    <span className="bg-indigo-600 text-white dark:bg-indigo-500 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                        {transformedData.items.length} items
                    </span>
                )}
            </h3>
            <div className="flex-1 min-h-0 overflow-y-auto font-mono text-xs p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
                <pre>{JSON.stringify(transformedData, null, 2)}</pre>
            </div>
        </div>
    );

    return (
        <div className="space-y-6 max-w-[120rem] mx-auto px-4 lg:px-8">
            <div className="lg:grid lg:grid-cols-12 lg:gap-8 items-start">
                {/* Main Action Card */}
                <div className="lg:col-span-7 space-y-6">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bulk Backlog Importer</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                                    Map user-friendly categories to backend constants automatically.
                                </p>
                            </div>
                            {/* Mobile View Toggle */}
                            <button 
                                onClick={() => setIsMobilePreviewOpen(true)}
                                disabled={!transformedData}
                                className="lg:hidden p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 transition-colors bg-slate-50 dark:bg-slate-800 rounded-lg disabled:opacity-50"
                                title="View Preview"
                            >
                                <EyeIcon className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Raw JSON Input
                                </label>
                                
                                <div className="relative flex border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500 transition-all bg-slate-50 dark:bg-slate-950">
                                    {/* Line Numbers Gutter */}
                                    <div 
                                        className="w-12 shrink-0 bg-slate-100/50 dark:bg-slate-900/50 border-r border-slate-200 dark:border-slate-800 font-mono text-xs sm:text-sm text-slate-400 py-4 text-center select-none overflow-hidden relative h-96 lg:h-[30rem]"
                                    >
                                        <div 
                                            ref={gutterRef}
                                            className="absolute inset-0 overflow-hidden py-4"
                                        >
                                            {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
                                                <div 
                                                    key={i} 
                                                    className={`h-6 leading-6 ${errorLine === i + 1 ? 'text-red-500 font-bold bg-red-500/10' : ''}`}
                                                >
                                                    {i + 1}
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Scrollable Decoration Layer (Behind Textarea for squigglies) */}
                                    <div 
                                        className="absolute left-12 right-0 top-0 bottom-0 pointer-events-none overflow-hidden py-4"
                                    >
                                        <div 
                                            ref={decorationRef}
                                            className="w-full h-full relative font-mono text-xs sm:text-sm leading-6 px-4 whitespace-pre text-transparent transition-all"
                                        >
                                            {errorPosition !== null ? (
                                                <>
                                                    {jsonInput.substring(0, errorPosition)}
                                                    <span className="border-b-4 border-red-500 bg-red-500/30 font-bold">
                                                        {jsonInput.substring(errorPosition, errorPosition + 1) || ' '}
                                                    </span>
                                                    {jsonInput.substring(errorPosition + 1)}
                                                </>
                                            ) : (
                                                jsonInput
                                            )}
                                        </div>
                                    </div>

                                    {/* Textarea wrapped for scroll sync */}
                                    <textarea
                                        ref={textareaRef}
                                        value={jsonInput}
                                        onChange={(e) => setJsonInput(e.target.value)}
                                        onScroll={(e) => {
                                            const scrollTop = e.currentTarget.scrollTop;
                                            const scrollLeft = e.currentTarget.scrollLeft;
                                            if (gutterRef.current) gutterRef.current.scrollTop = scrollTop;
                                            if (highlightRef.current) highlightRef.current.scrollTop = scrollTop;
                                            if (decorationRef.current) {
                                                decorationRef.current.scrollTop = scrollTop;
                                                decorationRef.current.scrollLeft = scrollLeft;
                                            }
                                        }}
                                        placeholder='[{"title": "Recipe Name", "category": "Verduras y Guarniciones"}]'
                                        spellCheck={false}
                                        className="w-full h-96 lg:h-[30rem] px-4 py-4 font-mono text-xs sm:text-sm bg-transparent border-0 focus:ring-0 transition-all outline-none resize-none leading-6 overflow-auto whitespace-pre relative z-10 text-slate-800 dark:text-slate-200"
                                    />
                                </div>
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
                                className={`w-full py-4 px-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
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
                </div>

                {/* Desktop Preview Column */}
                <div className="hidden lg:block lg:col-span-5 sticky top-8 h-[calc(100vh-12rem)]">
                    {transformedData ? (
                        <PreviewContent />
                    ) : (
                        <div className="bg-slate-50 dark:bg-slate-950 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl h-full flex flex-col items-center justify-center text-slate-400 text-center p-8">
                            <EyeIcon className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm">Start pasting JSON to see the<br />transformed preview here.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Preview Bottom Sheet (Pattern from ReviewLogsBoard) */}
            {isMobilePreviewOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col justify-end lg:hidden">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" 
                        onClick={() => setIsMobilePreviewOpen(false)}
                    ></div>
                    
                    {/* Sheet Container */}
                    <div className="relative w-full bg-white dark:bg-slate-900 h-[85vh] rounded-t-3xl shadow-2xl flex flex-col animate-in slide-in-from-bottom duration-300 overflow-hidden">
                        {/* Drag Handle */}
                        <div 
                            className="w-full h-8 flex justify-center items-start pt-3 shrink-0 cursor-pointer" 
                            onClick={() => setIsMobilePreviewOpen(false)}
                        >
                            <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                        </div>

                        {/* Modal Header */}
                        <div className="px-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transformed Preview</h3>
                                <p className="text-xs text-slate-500 mt-1">Bulk Importer Verification</p>
                            </div>
                            <button 
                                onClick={() => setIsMobilePreviewOpen(false)}
                                className="p-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-full text-slate-500 transition-colors"
                            >
                                <XIcon className="w-5 h-5"/>
                            </button>
                        </div>

                        {/* Scrollable Content Area */}
                        <div className="flex-grow overflow-y-auto custom-scrollbar">
                            <div className="p-6">
                                <PreviewContent />
                            </div>
                        </div>
                        
                        {/* Footer Spacer (Optional, helps on iOS Safari) */}
                        <div className="h-4 shrink-0"></div>
                    </div>
                </div>
            )}
        </div>
    );
};
