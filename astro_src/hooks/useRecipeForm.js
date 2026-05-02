import { useState, useEffect, useCallback, useRef } from 'react';
import { useApiClient } from '@hooks/useApiClient';
import { useAuth } from '@context/AuthContext';
import { useToast } from '@context/ToastContext';
import { feedCache } from '@utils/feedCache';
// import { actions } from 'astro:actions'; // DELETED: Causes build error in Next.js

const INITIAL_STATE = {
  name: '',
  description: '',
  preparationTime: '',
  imageUrl: '',
  ingredients: [{ name: '', quantity: '', unit_of_measure: '' }],
  instructions: [''], // Default to Array<String>
  type: 'LUNCH',
  visibility: 'public',
};

export function useRecipeForm(recipeId) {
  const api = useApiClient();
  const { user } = useAuth();
  const { showToast } = useToast();
  const isEditMode = !!recipeId;

  const [formData, setFormData] = useState(INITIAL_STATE);
  const [status, setStatus] = useState(isEditMode ? 'loading' : 'idle');
  const [apiError, setApiError] = useState(null);
  const [errors, setErrors] = useState({});
  const initialPayloadRef = useRef(null);

  /**
   * Proactive Authentication Check
   * Ensures users are logged in to access the form (Create or Edit)
   */
  useEffect(() => {
    if (typeof window !== 'undefined' && user === null) {
      // Small delay to allow session check to complete
      const timer = setTimeout(() => {
        const state = useAuth.getState();
        if (state.user === null && !state.isLoading) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [user]);

  /**
   * Data Fetching & Normalization Strategy
   * Handles migration from Object-based instructions to Array-based instructions.
   */
  useEffect(() => {
    if (!isEditMode) return;

    let isMounted = true;

    api.getRecipeById(recipeId)
      .then(recipe => {
        if (!isMounted) return;

        if (!recipe) {
          setApiError('No se encontró la receta.');
          setStatus('error');
          return;
        }

        // --- SECURITY CHECK: Ownership Verification ---
        // We defer the finalized check to a dedicated effect below to ensure 'user' is fully loaded.
        // But we store the author info to detect unauthorized access early.
        const loadedData = {
          name: recipe.name || '',
          description: recipe.description || '',
          preparationTime: recipe.preparationTimeMinutes || recipe.preparation_time_minutes || '',
          imageUrl: recipe.imageUrl || recipe.image_url || '',
          ingredients: recipe.ingredients?.map(ing => ({
            name: ing.name || ing.ingredient?.name || '',
            quantity: ing.quantity || '',
            unit_of_measure: ing.unitOfMeasure || ing.unit_of_measure || '',
          })) || [{ name: '', quantity: '', unit_of_measure: '' }],
          instructions: Array.isArray(recipe.instructions) ? recipe.instructions : Object.values(recipe.instructions || {}),
          type: recipe.type || 'LUNCH',
          visibility: recipe.visibility || 'public',
        };

        setFormData({
          ...loadedData,
          // Store author info for reactive security check
          _authorId: recipe.user_id || recipe.user?.id,
          _authorName: recipe.authorName || recipe.author_name || recipe.user?.name
        });

        // Store standard payload for dirty checking
        initialPayloadRef.current = JSON.stringify({
          name: loadedData.name,
          description: loadedData.description,
          type: loadedData.type,
          visibility: loadedData.visibility,
          preparationTimeMinutes: parseInt(loadedData.preparationTime, 10),
          imageUrl: (loadedData.imageUrl || '').trim(),
          ingredients: loadedData.ingredients.filter(i => (i.name || '').trim()).map(i => ({
            name: (i.name || '').trim(),
            unitOfMeasure: (i.unit_of_measure || '').trim(),
            quantity: i.quantity ? parseFloat(i.quantity) : undefined
          })),
          instructions: loadedData.instructions.map(s => (s || '').trim()).filter(s => s.length > 0)
        });

        setStatus('idle');
      })
      .catch(err => {
        if (!isMounted) return;
        console.error('[RecipeForm] Fetch Error:', err);
        setApiError(err.message || 'Error al cargar la receta.');
        setStatus('error');
      });

    return () => { isMounted = false; };
  }, [recipeId, api, isEditMode]);

  /**
   * --- REACTIVE SECURITY CHECK ---
   * This ensures that even if 'user' loads AFTER the recipe, or vice-versa,
   * the authorization check is executed correctly.
   */
  /**
   * --- CONSOLIDATED OWNERSHIP LOGIC ---
   */
  const normalize = useCallback((str) => String(str || '').trim().toLowerCase(), []);

  const matchesId = !!(user?.id && formData._authorId && String(user.id) === String(formData._authorId));
  const matchesName = !!(user?.name && formData._authorName && normalize(user.name) === normalize(formData._authorName));
  const isOwner = isEditMode ? (matchesId || matchesName) : true;

  /**
   * --- REACTIVE SECURITY REDIRECTION ---
   * Ensures that even if 'user' or 'recipe' loads out of sync,
   * unauthorized access triggers a prompt redirection.
   */
  useEffect(() => {
    // Only run this check in edit mode when both auth and recipe are no longer loading
    if (!isEditMode || status === 'loading' || useAuth.getState().isLoading) return;

    // Wait until we have at least ID or Name to make a decision
    if (!formData._authorId && !formData._authorName) return;

    // If a user IS logged in, verify ownership.
    if (user && !isOwner) {
      console.warn(`[Security] Unauthorized edit attempt for recipe ${recipeId} by user ${user.id}`);
      showToast('No tienes permiso para editar esta receta.', 'error');
      window.location.href = `/recipes/${recipeId}`;
    }
  }, [user, isOwner, isEditMode, status, recipeId, showToast, formData._authorId, formData._authorName]);

  // --- Field Handlers ---

  const setFieldValue = useCallback((name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear specific field error on change
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }, [errors]);

  const handleIngredientChange = useCallback((index, field, value) => {
    setFormData(prev => {
      const newIngs = [...prev.ingredients];
      newIngs[index] = { ...newIngs[index], [field]: value };
      return { ...prev, ingredients: newIngs };
    });
    if (errors.ingredientsRoot) setErrors(prev => ({ ...prev, ingredientsRoot: undefined }));
  }, [errors]);

  const handleInstructionChange = useCallback((index, value) => {
    setFormData(prev => {
      const newInst = [...prev.instructions];
      newInst[index] = value;
      return { ...prev, instructions: newInst };
    });
    if (errors.instructionsRoot) setErrors(prev => ({ ...prev, instructionsRoot: undefined }));
  }, [errors]);

  const modifyList = useCallback((listName, action, index) => {
    setFormData(prev => {
      const list = [...prev[listName]];
      if (action === 'add') {
        const item = listName === 'ingredients'
          ? { name: '', quantity: '', unit_of_measure: '' }
          : '';
        list.push(item);
      } else if (action === 'remove') {
        if (list.length > 1) list.splice(index, 1);
      }
      return { ...prev, [listName]: list };
    });
  }, []);

  const handleDraftLoaded = (draftData) => {
    setFormData(prev => ({
      ...prev,
      ...draftData,
      // Ensure strictly array format from AI response
      instructions: Array.isArray(draftData.instructions) ? draftData.instructions : ['']
    }));
  };

  // --- Validation & Submission ---

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim() || formData.name.length < 3) newErrors.name = 'Mínimo 3 caracteres.';
    if (!formData.description?.trim()) newErrors.description = 'Descripción requerida.';
    if (!formData.preparationTime || isNaN(Number(formData.preparationTime))) newErrors.preparationTime = 'Tiempo inválido.';
    if (!formData.imageUrl?.trim()) newErrors.imageUrl = 'URL de imagen requerida.';

    // Validate Instructions (Array<String>)
    const validInstructions = formData.instructions.filter(i => (i || '').trim().length >= 5);
    if (validInstructions.length === 0) {
      newErrors.instructionsRoot = 'Al menos una instrucción válida (min 5 letras).';
    }

    // Validate Ingredients
    const validIngredients = formData.ingredients.filter(i => (i.name || '').trim() && (i.unit_of_measure || '').trim());
    if (validIngredients.length === 0) {
      newErrors.ingredientsRoot = 'Al menos un ingrediente válido.';
    }

    return newErrors;
  };

  const submit = async (e) => {
    e.preventDefault();
    setApiError(null);

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setStatus('submitting');

    // Payload Sanitization
    const payload = {
      name: formData.name,
      description: formData.description,
      type: formData.type,
      visibility: 'public', // Force all recipes to be public
      preparationTimeMinutes: parseInt(formData.preparationTime, 10),
      imageUrl: (formData.imageUrl || '').trim(),

      ingredients: formData.ingredients
        .filter(i => (i.name || '').trim())
        .map(i => ({
          name: (i.name || '').trim(),
          unitOfMeasure: (i.unit_of_measure || '').trim(),
          quantity: i.quantity ? parseFloat(i.quantity) : undefined
        })),

      // STRICT ARRAY SUBMISSION:
      // Sends ["Step 1", "Step 2"] directly to backend. 
      instructions: formData.instructions
        .map(s => (s || '').trim())
        .filter(s => s.length > 0)
    };

    // Dirty Checking logic
    if (isEditMode && initialPayloadRef.current === JSON.stringify(payload)) {
      // No changes were made, immediately return without making an API request
      showToast('No se detectaron cambios.', 'success');
      window.location.href = `/recipes/${recipeId}`;
      return;
    }

    try {
      if (isEditMode) {
        await api.updateRecipe(recipeId, payload);

        // Update local cache immediately so the Feed reflects changes without reload
        feedCache.updateRecipe({
          id: recipeId,
          ...payload
        });

        showToast('Receta actualizada', 'success');
      } else {
        await api.createRecipe(payload);
        showToast('Receta creada', 'success');
      }

      // Invalidate Cloudflare Cache On-Demand for global feed
      try {
        // Dynamic import to avoid Next.js build errors
        const pkg = 'astro:actions';
        const { actions } = await import(/* webpackIgnore: true */ pkg);
        if (actions && typeof actions.purgeRecipesCache === 'function') {
          await actions.purgeRecipesCache();
        }
      } catch (cacheErr) {
        // Safe to ignore if not in Astro or action not found
        console.debug('Astro cache purge skipped or unavailable in this environment.');
      }

      window.location.href = '/';
    } catch (err) {
      console.error(err);
      setApiError(err.message || 'Error al procesar la solicitud.');
      setStatus('idle');
    }
  };

  return {
    formData,
    status,
    errors,
    apiError,
    isOwner, // Exposed for UI blocking
    handlers: {
      setFieldValue,
      handleIngredientChange,
      handleInstructionChange,
      modifyList,
      handleDraftLoaded,
      submit,
      retry: () => window.location.reload()
    }
  };
}