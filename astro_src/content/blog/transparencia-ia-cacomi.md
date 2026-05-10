---
title: "Transparencia: Cómo usamos la Inteligencia Artificial en Cacomi"
description: "Un vistazo técnico y ético a cómo funciona el 'cerebro' detrás de tu planificador de comidas y por qué siempre tienes el control final."
date: "2026-05-09"
author: "Equipo Técnico de Cacomi"
---
En los últimos años, el término "Inteligencia Artificial" (IA) se ha usado para vender desde cepillos de dientes hasta tostadoras. En Cacomi, creemos firmemente que la IA no debe ser un truco de marketing, sino una herramienta invisible que resuelve un problema real: **la carga mental de decidir qué comer todos los días.**
Hoy queremos abrir las puertas de nuestra "cocina digital" y explicar de forma transparente a nuestra comunidad (desde desarrolladores hasta usuarios diarios) cómo usamos la IA, qué datos lee y por qué diseñamos el sistema para que tú siempre tengas el control.
## El problema del recetario estático
Los blogs de cocina tradicionales y las apps de recetas antiguas funcionan como un diccionario: tú tienes que saber qué buscar. Si tienes un calabacín, medio kilo de pollo y un tomate, tienes que buscar recetas, cruzar ingredientes, darte cuenta de que te falta crema, ir al súper, etc.
Ese proceso es lo que hace que terminemos pidiendo comida a domicilio. 
## Nuestro enfoque: La IA como "Sous-Chef"
En Cacomi utilizamos modelos de lenguaje avanzados (específicamente la tecnología de Google Gemini) para actuar como tu *sous-chef* personal. No usamos la IA para inventar comida de la nada, la usamos para **conectar puntos**.
### 1. Generación de Recetas a partir del Caos
Cuando usas la función de "Generación Mágica", le pasas un prompt simple ("cena ligera con salmón"). Nuestro modelo está entrenado mediante un sistema de instrucciones estandarizadas (JSON schemas) para devolver una receta estructurada: ingredientes con gramos exactos, tiempos de cocción y pasos ordenados.
### 2. El Planificador Semanal Dinámico
Este es nuestro mayor orgullo técnico. Cuando presionas "Generar con IA" en tu planificador, el sistema hace lo siguiente en cuestión de milisegundos:
1. **Lee tu perfil:** Revisa si eres vegano, si tienes intolerancias o tus calorías objetivo.
2. **Lee tu despensa local:** (Si la tienes configurada). Revisa qué ingredientes tienes a punto de caducar.
3. **Analiza tus pines:** Respeta las comidas que has "fijado" (pineado) para no tocarlas.
4. **Calcula el presupuesto:** Intenta mantener el costo total dentro de un rango razonable.
Luego, la IA ensambla un puzzle de 7 días, asegurando variedad (que no comas pasta tres días seguidos) y enviando el resultado de vuelta a tu dispositivo.
## Privacidad y Ética de Datos
Sabemos que la privacidad es fundamental. Por eso, en Cacomi hemos tomado decisiones arquitectónicas muy específicas:
* **Tus datos están anonimizados:** Cuando pedimos a la IA que genere un plan, no enviamos tu nombre ni tu correo. Solo enviamos parámetros matemáticos: *Usuario X necesita 2000 calorías, es vegetariano y tiene estos 5 ingredientes.*
* **Nuestra política de Offline-First:** Diseñamos Cacomi para que tus planes semanales y recetas se guarden en tu dispositivo localmente mediante Service Workers. Tú eres dueño de tu información.
* **Transparencia Legal:** Todas las recetas generadas automáticamente llevan una etiqueta visible de "Generado por IA". Es nuestra responsabilidad advertirte que un modelo puede equivocarse (por ejemplo, sugiriendo combinar dos ingredientes que saben horrible juntos).
## El toque humano es irreemplazable
A pesar de toda esta tecnología, nuestro principio fundacional es: **Tú tienes el control siempre.**
La IA sugiere, el humano decide. Puedes arrastrar, soltar, eliminar y cambiar cualquier recomendación que te demos. Cacomi no pretende reemplazar la creatividad humana en la cocina, sino eliminar el trabajo aburrido (hacer listas, contar gramos, buscar qué hacer con sobras) para que tú solo te dediques a disfrutar cocinando.
