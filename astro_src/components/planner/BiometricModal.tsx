import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ChevronRight, User, Calendar, Ruler, Activity, Target, Weight, Info } from 'lucide-react';

interface BiometricModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaveSuccess: () => void;
    language: 'es' | 'en';
}

export function BiometricModal({ isOpen, onClose, onSaveSuccess, language }: BiometricModalProps) {
    const [formData, setFormData] = useState({
        gender: 'MALE',
        birthDate: '',
        heightCm: 0,
        activityLevel: 'SEDENTARY',
        currentWeightKg: 0,
        goalType: 'MAINTENANCE',
        targetWeightKg: 0
    });

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        // Validation
        if (!formData.birthDate || formData.heightCm <= 0 || formData.currentWeightKg <= 0 || formData.targetWeightKg <= 0) {
            setError(language === 'es' ? 'Por favor completa todos los campos correctamente.' : 'Please fill all fields correctly.');
            return;
        }

        // Age validation (18+)
        const birthDate = new Date(formData.birthDate);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }

        if (age < 18) {
            setError(language === 'es' ? 'Debes ser mayor de 18 años para usar este servicio.' : 'You must be at least 18 years old to use this service.');
            return;
        }

        setIsSaving(true);
        setError(null);
        try {
            const response = await fetch('/api/proxy/users/me/biometric-profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                onSaveSuccess();
                onClose();
            } else {
                const errData = await response.json();
                setError(errData.message || (language === 'es' ? 'Error al guardar el perfil' : 'Error saving profile'));
            }
        } catch (e) {
            console.error(e);
            setError(language === 'es' ? 'Error de conexión' : 'Connection error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={language === 'es' ? 'Completa tu Perfil' : 'Complete Your Profile'}>
            <div className="space-y-6">
                <div className="flex gap-4 p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                    <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Info className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                        {language === 'es' 
                            ? '¡Casi listo! Necesitamos estos datos básicos para que el Chef AI pueda calcular tus calorías y metas nutricionales con precisión.' 
                            : 'Almost ready! We need these basic details so the AI Chef can accurately calculate your calories and nutritional goals.'}
                    </p>
                </div>

                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-destructive text-xs font-bold">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Gender */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <User className="w-3 h-3" /> {language === 'es' ? 'Género' : 'Gender'}
                        </label>
                        <select 
                            className="w-full h-11 bg-muted/30 border border-border/50 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.gender}
                            onChange={e => setFormData({...formData, gender: e.target.value})}
                        >
                            <option value="MALE">{language === 'es' ? 'Masculino' : 'Male'}</option>
                            <option value="FEMALE">{language === 'es' ? 'Femenino' : 'Female'}</option>
                        </select>
                    </div>

                    {/* BirthDate */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Calendar className="w-3 h-3" /> {language === 'es' ? 'Fecha de Nacimiento' : 'Birth Date'}
                        </label>
                        <input 
                            type="date"
                            className="w-full h-11 bg-muted/30 border border-border/50 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.birthDate}
                            onChange={e => setFormData({...formData, birthDate: e.target.value})}
                        />
                    </div>

                    {/* Height */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Ruler className="w-3 h-3" /> {language === 'es' ? 'Altura (cm)' : 'Height (cm)'}
                        </label>
                        <input 
                            type="number"
                            className="w-full h-11 bg-muted/30 border border-border/50 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.heightCm}
                            onChange={e => setFormData({...formData, heightCm: parseInt(e.target.value)})}
                        />
                    </div>

                    {/* Current Weight */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Weight className="w-3 h-3" /> {language === 'es' ? 'Peso Actual (kg)' : 'Current Weight (kg)'}
                        </label>
                        <input 
                            type="number"
                            step="0.1"
                            className="w-full h-11 bg-muted/30 border border-border/50 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.currentWeightKg}
                            onChange={e => setFormData({...formData, currentWeightKg: parseFloat(e.target.value)})}
                        />
                    </div>

                    {/* Activity Level */}
                    <div className="col-span-full space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Activity className="w-3 h-3" /> {language === 'es' ? 'Nivel de Actividad' : 'Activity Level'}
                        </label>
                        <select 
                            className="w-full h-11 bg-muted/30 border border-border/50 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.activityLevel}
                            onChange={e => setFormData({...formData, activityLevel: e.target.value})}
                        >
                            <option value="SEDENTARY">{language === 'es' ? 'Sedentario (Poco o nada)' : 'Sedentary'}</option>
                            <option value="LIGHTLY_ACTIVE">{language === 'es' ? 'Ligero (1-3 días)' : 'Lightly Active'}</option>
                            <option value="MODERATELY_ACTIVE">{language === 'es' ? 'Moderado (3-5 días)' : 'Moderately Active'}</option>
                            <option value="VERY_ACTIVE">{language === 'es' ? 'Fuerte (6-7 días)' : 'Very Active'}</option>
                            <option value="EXTRA_ACTIVE">{language === 'es' ? 'Muy Fuerte / Trabajo Físico' : 'Extra Active'}</option>
                        </select>
                    </div>

                    {/* Goal Type */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Target className="w-3 h-3" /> {language === 'es' ? 'Objetivo' : 'Goal'}
                        </label>
                        <select 
                            className="w-full h-11 bg-muted/30 border border-border/50 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.goalType}
                            onChange={e => setFormData({...formData, goalType: e.target.value})}
                        >
                            <option value="WEIGHT_LOSS">{language === 'es' ? 'Bajar de Peso' : 'Weight Loss'}</option>
                            <option value="MUSCLE_GAIN">{language === 'es' ? 'Ganar Músculo' : 'Muscle Gain'}</option>
                            <option value="MAINTENANCE">{language === 'es' ? 'Mantener Peso' : 'Maintenance'}</option>
                            <option value="EAT_HEALTHIER">{language === 'es' ? 'Comer Sano' : 'Eat Healthier'}</option>
                        </select>
                    </div>

                    {/* Target Weight */}
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-1.5">
                            <Weight className="w-3 h-3" /> {language === 'es' ? 'Peso Meta (kg)' : 'Target Weight (kg)'}
                        </label>
                        <input 
                            type="number"
                            step="0.1"
                            className="w-full h-11 bg-muted/30 border border-border/50 rounded-xl px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                            value={formData.targetWeightKg}
                            onChange={e => setFormData({...formData, targetWeightKg: parseFloat(e.target.value)})}
                        />
                    </div>
                </div>

                <div className="pt-4 pb-2">
                    <Button 
                        onClick={handleSave} 
                        isLoading={isSaving}
                        className="w-full h-12 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                    >
                        {language === 'es' ? 'Guardar y Comenzar Mi Plan' : 'Save and Start My Plan'}
                        <ChevronRight className="w-4 h-4" />
                    </Button>
                </div>
            </div>
        </Modal>
    );
}
