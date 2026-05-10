import React, { useState, useEffect, useCallback, useRef } from 'react';
import { getDailyPuzzleId, isValidWord } from '@/lib/game/words';
import { Share2, Utensils, AlertCircle, Trophy, Users, Play, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const WORD_LENGTH = 5;
const MAX_ATTEMPTS = 6;

type LetterState = 'correct' | 'present' | 'absent' | 'empty';

interface GameState {
    guesses: string[];
    guessResults: LetterState[][];
    currentGuess: string;
    gameStatus: 'playing' | 'won' | 'lost';
    lastPlayedDate: string;
    revealedWord?: string;
}

export function SecretIngredientGame() {
    const puzzleId = getDailyPuzzleId();
    const { user, isAuthenticated } = useAuth();

    const [activeTab, setActiveTab] = useState<'game' | 'leaderboard'>('game');
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
    const [hasSubmitted, setHasSubmitted] = useState(false);
    const [isCheckingGuess, setIsCheckingGuess] = useState(false);

    const [gameState, setGameState] = useState<GameState>({
        guesses: [],
        guessResults: [],
        currentGuess: '',
        gameStatus: 'playing',
        lastPlayedDate: puzzleId
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [isLoaded, setIsLoaded] = useState(false);

    // Load state from LocalStorage on mount
    useEffect(() => {
        try {
            const savedState = localStorage.getItem('cacomi_daily_game');
            if (savedState) {
                const parsed = JSON.parse(savedState);
                
                // Validación de estructura: Si faltan los nuevos campos (guessResults), reiniciamos
                const isLegacy = !parsed.guessResults || parsed.lastPlayedDate !== puzzleId;
                
                if (isLegacy) {
                    setGameState({
                        guesses: [],
                        guessResults: [],
                        currentGuess: '',
                        gameStatus: 'playing',
                        lastPlayedDate: puzzleId
                    });
                    setHasSubmitted(false);
                    localStorage.removeItem('cacomi_game_submitted');
                } else {
                    setGameState(parsed);
                    const submitted = localStorage.getItem('cacomi_game_submitted');
                    if (submitted === puzzleId) setHasSubmitted(true);
                }
            }
        } catch (e) {
            console.error("Error al cargar estado del juego", e);
        }
        setIsLoaded(true);
    }, [puzzleId]);

    // Save state to LocalStorage whenever it changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cacomi_daily_game', JSON.stringify(gameState));
        }
    }, [gameState, isLoaded]);

    const fetchLeaderboard = async () => {
        setIsLoadingLeaderboard(true);
        try {
            const res = await fetch('/api/game/leaderboard');
            if (res.ok) {
                const data = await res.json();
                setLeaderboard(data);
            }
        } catch (e) {
            console.error("Error fetching leaderboard", e);
        } finally {
            setIsLoadingLeaderboard(false);
        }
    };

    useEffect(() => {
        if (activeTab === 'leaderboard') {
            fetchLeaderboard();
        }
    }, [activeTab]);

    const submitScore = async () => {
        if (!isAuthenticated || !user || hasSubmitted || gameState.gameStatus !== 'won') return;

        try {
            const res = await fetch('/api/game/leaderboard', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: user.name || 'Cocinero Anónimo',
                    score: gameState.guesses.length
                })
            });

            if (res.ok) {
                setHasSubmitted(true);
                localStorage.setItem('cacomi_game_submitted', puzzleId);
                showError('¡Puntuación enviada con éxito!');
                fetchLeaderboard();
            }
        } catch (e) {
            showError('Error al enviar puntuación');
        }
    };

    const showError = (msg: string) => {
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(''), 2000);
    };

    const handleKeyPress = useCallback(async (key: string) => {
        if (gameState.gameStatus !== 'playing' || isCheckingGuess) return;

        if (key === 'Enter') {
            const guess = gameState.currentGuess;
            if (guess.length !== WORD_LENGTH) {
                showError('Faltan letras');
                return;
            }
            if (!isValidWord(guess)) {
                showError('Palabra no válida');
                return;
            }

            setIsCheckingGuess(true);
            try {
                const res = await fetch('/api/game/check-guess', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ guess })
                });

                if (!res.ok) throw new Error();

                const data = await res.json();
                
                setGameState(prev => {
                    const newGuesses = [...prev.guesses, guess];
                    const newResults = [...prev.guessResults, data.states];
                    let newStatus = prev.gameStatus;
                    
                    if (data.won) {
                        newStatus = 'won';
                    } else if (newGuesses.length >= MAX_ATTEMPTS) {
                        newStatus = 'lost';
                    }
                    
                    return { 
                        ...prev, 
                        guesses: newGuesses, 
                        guessResults: newResults, 
                        currentGuess: '', 
                        gameStatus: newStatus,
                        revealedWord: data.word || (newStatus === 'lost' ? data.correctWord : prev.revealedWord)
                    };
                });
            } catch (e) {
                showError('Error de conexión');
            } finally {
                setIsCheckingGuess(false);
            }
            return;
        }

        setGameState((prev) => {
            const newGuess = prev.currentGuess;
            
            if (key === 'Backspace' || key === 'Delete') {
                return { ...prev, currentGuess: newGuess.slice(0, -1) };
            }
            
            if (/^[A-ZÑ]$/i.test(key) && newGuess.length < WORD_LENGTH) {
                return { ...prev, currentGuess: newGuess + key.toUpperCase() };
            }
            
            return prev;
        });
    }, [gameState.gameStatus, isCheckingGuess, gameState.currentGuess]);

    // Guardamos la función en un ref para que el listener sea estable
    const handleKeyPressRef = useRef(handleKeyPress);
    useEffect(() => {
        handleKeyPressRef.current = handleKeyPress;
    }, [handleKeyPress]);

    // Physical Keyboard listener
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey || e.altKey) return;
            
            if (e.key === 'Enter' || e.key === 'Backspace') {
                handleKeyPressRef.current(e.key);
            } else if (/^[a-zA-ZñÑ]$/.test(e.key)) {
                handleKeyPressRef.current(e.key.toUpperCase());
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []); // Listener estable, no depende de handleKeyPress directamente

    const keyboardRows = [
        ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
        ['Enter', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'Backspace']
    ];

    // Calculamos el estado global de las teclas (para colorear el teclado)
    const keyStates: Record<string, LetterState> = {};
    gameState.guesses.forEach((guess, guessIdx) => {
        const results = gameState.guessResults[guessIdx];
        if (!results) return;
        guess.split('').forEach((letter, i) => {
            const state = results[i];
            const currentState = keyStates[letter];
            if (state === 'correct' || (state === 'present' && currentState !== 'correct')) {
                keyStates[letter] = state;
            } else if (state === 'absent' && !currentState) {
                keyStates[letter] = 'absent';
            }
        });
    });

    const generateShareText = () => {
        const grid = gameState.guesses.map((guess, idx) => {
            const results = gameState.guessResults[idx];
            return results.map((state) => {
                if (state === 'correct') return '🟩';
                if (state === 'present') return '🟨';
                return '⬜';
            }).join('');
        }).join('\n');
        
        const attempts = gameState.gameStatus === 'won' ? gameState.guesses.length : 'X';
        const text = `Cacomi Reto Diario 🍳\nIntentos: ${attempts}/${MAX_ATTEMPTS}\n\n${grid}\n\nJuega gratis en: cacomi.app/juego`;
        return text;
    };

    const handleShare = async () => {
        const text = generateShareText();
        if (navigator.share) {
            try {
                await navigator.share({ text });
            } catch (e) {
                console.log('Cancelado');
            }
        } else {
            navigator.clipboard.writeText(text);
            showError('Copiado al portapapeles');
        }
    };

    if (!isLoaded) return null; // Avoid hydration mismatch

    return (
        <div className="flex flex-col items-center justify-center max-w-lg mx-auto p-4 min-h-[calc(100vh-140px)]">
            <header className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 text-primary font-bold mb-2">
                    <Utensils className="w-6 h-6" />
                    <span className="uppercase tracking-widest text-sm">El Reto Diario</span>
                </div>
                <h1 className="text-3xl font-extrabold dark:text-white">El Ingrediente Secreto</h1>
                <p className="text-muted-foreground text-sm mt-1">Adivina la palabra culinaria de 5 letras.</p>
            </header>

            {/* Tabs */}
            <div className="flex bg-muted/50 p-1 rounded-2xl mb-8 w-full max-w-[320px]">
                <button 
                    onClick={() => setActiveTab('game')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'game' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Play className="w-4 h-4" />
                    Jugar
                </button>
                <button 
                    onClick={() => setActiveTab('leaderboard')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'leaderboard' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    <Users className="w-4 h-4" />
                    Top 10
                </button>
            </div>

            {activeTab === 'game' ? (
                <>
                    {/* Error Message Toast */}
                    <div className={`fixed top-24 left-1/2 -translate-x-1/2 bg-foreground text-background px-4 py-2 rounded-xl font-bold transition-all z-50 flex items-center gap-2 shadow-lg ${errorMsg ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                        <AlertCircle className="w-4 h-4" />
                        {errorMsg}
                    </div>

                    {/* Game Grid */}
                    <div className="grid grid-rows-6 gap-2 mb-8 w-full max-w-[320px]">
                        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
                            const guess = gameState.guesses[rowIndex];
                            const results = gameState.guessResults[rowIndex];
                            const isCurrentRow = rowIndex === gameState.guesses.length;
                            
                            return (
                                <div key={rowIndex} className="grid grid-cols-5 gap-2">
                                    {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                                        let letter = '';
                                        let state: LetterState = 'empty';
                                        
                                        if (guess) {
                                            letter = guess[colIndex];
                                            state = results ? results[colIndex] : 'empty';
                                        } else if (isCurrentRow && gameState.currentGuess[colIndex]) {
                                            letter = gameState.currentGuess[colIndex];
                                        }
                                        
                                        const baseClass = "w-full aspect-square flex items-center justify-center text-3xl font-extrabold rounded-xl transition-all duration-300 uppercase";
                                        let stateClass = "border-2 border-border/50 dark:border-gray-800 bg-transparent text-foreground";
                                        
                                        if (state === 'correct') {
                                            stateClass = "bg-green-500 border-green-500 text-white shadow-[0_0_15px_rgba(34,197,94,0.4)]";
                                        } else if (state === 'present') {
                                            stateClass = "bg-amber-400 border-amber-400 text-amber-950";
                                        } else if (state === 'absent') {
                                            stateClass = "bg-gray-200 border-gray-200 dark:bg-gray-800 dark:border-gray-800 text-gray-500";
                                        } else if (letter) {
                                            stateClass = "border-2 border-gray-400 dark:border-gray-500 text-foreground scale-105";
                                        }
                                        
                                        return (
                                            <div key={colIndex} className={`${baseClass} ${stateClass} ${isCurrentRow && isCheckingGuess ? 'animate-pulse opacity-50' : ''}`}>
                                                {letter}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>

                    {/* End Game Actions */}
                    {gameState.gameStatus !== 'playing' && (
                        <div className="mb-8 p-6 bg-muted/50 rounded-3xl border border-border/50 text-center w-full max-w-[320px] animate-in fade-in zoom-in">
                            <h2 className="text-2xl font-bold mb-2">
                                {gameState.gameStatus === 'won' ? '¡Delicioso! 🥳' : 'Se quemó 🍳'}
                            </h2>
                            <p className="text-muted-foreground mb-4">
                                La palabra era: <strong className="text-foreground uppercase">{gameState.revealedWord}</strong>
                            </p>
                            
                            <div className="flex flex-col gap-3">
                                <button 
                                    onClick={handleShare}
                                    className="w-full flex items-center justify-center gap-2 bg-muted-foreground text-background px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity"
                                >
                                    <Share2 className="w-5 h-5" />
                                    Compartir
                                </button>

                                {gameState.gameStatus === 'won' && isAuthenticated && !hasSubmitted && (
                                    <button 
                                        onClick={submitScore}
                                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-opacity shadow-[0_4px_14px_rgba(var(--primary-rgb),0.4)]"
                                    >
                                        <Trophy className="w-5 h-5" />
                                        Subir a Top 10
                                    </button>
                                )}

                                {gameState.gameStatus === 'won' && !isAuthenticated && (
                                    <p className="text-xs text-muted-foreground">
                                        <a href="/login" className="text-primary underline">Inicia sesión</a> para entrar al ranking.
                                    </p>
                                )}
                            </div>
                            
                            <p className="text-xs text-muted-foreground mt-4">Próxima receta mañana a media noche.</p>
                        </div>
                    )}

                    {/* Virtual Keyboard */}
                    <div className="w-full max-w-md mx-auto space-y-2">
                        {keyboardRows.map((row, i) => (
                            <div key={i} className="flex justify-center gap-1.5">
                                {row.map(key => {
                                    const isEnter = key === 'Enter';
                                    const isBack = key === 'Backspace';
                                    const state = keyStates[key];
                                    
                                    let bgClass = "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-foreground";
                                    if (state === 'correct') bgClass = "bg-green-500 text-white";
                                    else if (state === 'present') bgClass = "bg-amber-400 text-amber-950";
                                    else if (state === 'absent') bgClass = "bg-gray-300 dark:bg-gray-900 text-gray-400 dark:text-gray-600 opacity-50";

                                    return (
                                        <button
                                            key={key}
                                            disabled={isCheckingGuess}
                                            onClick={() => handleKeyPress(key)}
                                            className={`
                                                ${bgClass} 
                                                ${isEnter || isBack ? 'px-3 text-xs' : 'flex-1 text-sm'} 
                                                h-14 font-bold rounded-xl transition-colors active:scale-95 uppercase
                                                ${isCheckingGuess && isEnter ? 'opacity-50' : ''}
                                            `}
                                        >
                                            {isBack ? '⌫' : (isEnter && isCheckingGuess ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : key)}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </>
            ) : (
                <div className="w-full max-w-[360px] animate-in slide-in-from-bottom-4 duration-500">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl border border-border/50 shadow-xl overflow-hidden">
                        <div className="bg-primary p-6 text-white text-center">
                            <Trophy className="w-12 h-12 mx-auto mb-2 opacity-90" />
                            <h2 className="text-2xl font-black uppercase tracking-tight">Top 10 Cocineros</h2>
                            <p className="text-primary-foreground/80 text-xs font-bold">Los más rápidos del día</p>
                        </div>
                        
                        <div className="p-4">
                            {isLoadingLeaderboard ? (
                                <div className="py-12 flex flex-col items-center gap-4 text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <p className="font-medium">Consultando el ranking...</p>
                                </div>
                            ) : leaderboard.length > 0 ? (
                                <div className="space-y-2">
                                    {leaderboard.map((entry, idx) => (
                                        <div 
                                            key={idx} 
                                            className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${idx === 0 ? 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-900' : 'bg-muted/30 border-transparent'}`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? 'bg-amber-400 text-amber-900' : idx === 1 ? 'bg-gray-300 text-gray-700' : idx === 2 ? 'bg-orange-300 text-orange-900' : 'bg-muted text-muted-foreground'}`}>
                                                    {idx + 1}
                                                </div>
                                                <span className={`font-bold ${idx === 0 ? 'text-amber-900 dark:text-amber-200' : 'text-foreground'}`}>
                                                    {entry.name}
                                                </span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs font-bold text-muted-foreground uppercase">Intentos</span>
                                                <span className="font-black text-primary">{entry.score}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 text-center text-muted-foreground">
                                    <p className="font-medium">Nadie ha subido su puntuación hoy.</p>
                                    <p className="text-xs mt-1">¡Sé el primero en aparecer aquí!</p>
                                </div>
                            )}
                        </div>

                        {!isAuthenticated && (
                            <div className="p-4 bg-muted/20 border-t border-border/30 text-center">
                                <p className="text-xs text-muted-foreground font-medium">
                                    ¿Quieres aparecer aquí? <a href="/login" className="text-primary hover:underline font-bold">Inicia sesión</a>
                                </p>
                            </div>
                        )}
                    </div>

                    <button 
                        onClick={() => setActiveTab('game')}
                        className="w-full mt-6 flex items-center justify-center gap-2 text-muted-foreground font-bold hover:text-primary transition-colors"
                    >
                        Volver al reto
                    </button>
                </div>
            )}
        </div>
    );
}
