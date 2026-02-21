# 💰 SplitHome — Finanzas del Hogar

App para controlar gastos del hogar, dividir cuentas entre parejas/roommates, y saber quién debe a quién.

## ✨ Características

- 📊 Dashboard con resumen de ingresos, gastos y balance
- 💸 Registro de gastos diarios con 18 categorías
- 📌 Gastos fijos mensuales (alquiler, carro, seguros...)
- 💵 Control de ingresos por persona
- ⚖️ Cálculo automático de deudas entre miembros
- 👥 Soporte para 2-4 personas
- 💱 11 monedas disponibles
- 📱 PWA instalable (funciona como app nativa)
- ☁️ Sincronización en la nube (opcional con Supabase)
- 🔒 Datos privados y encriptados

---

## 🚀 GUÍA RÁPIDA — Publicar en 15 minutos

### Paso 1: Instalar Node.js
Si no lo tienes, descárgalo de https://nodejs.org (versión LTS)

### Paso 2: Instalar dependencias
```bash
cd splithome
npm install
```

### Paso 3: Probar localmente
```bash
npm run dev
```
Abre http://localhost:5173 en tu navegador.

### Paso 4: Subir a GitHub
```bash
git init
git add .
git commit -m "SplitHome v1.0"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/splithome.git
git push -u origin main
```

### Paso 5: Deploy en Vercel (GRATIS)
1. Ve a https://vercel.com y crea cuenta con tu GitHub
2. Click "Add New Project"
3. Selecciona el repo "splithome"
4. Click "Deploy"
5. ¡LISTO! Tu app estará en `https://splithome.vercel.app`

### Paso 6 (OPCIONAL): Dominio personalizado
En Vercel > Settings > Domains, agrega tu dominio.
Ejemplo: `finanzas.tudominio.com`

---

## ☁️ RESPALDO EN LA NUBE (Opcional pero recomendado)

Sin Supabase, la app funciona perfecto pero los datos se guardan solo en el navegador.
Con Supabase, los datos se respaldan en la nube y puedes acceder desde cualquier dispositivo.

### Configurar Supabase (GRATIS)

1. **Crear cuenta** en https://supabase.com
2. **Crear proyecto** nuevo (elige nombre y contraseña para la DB)
3. **Crear tabla**: Ve a SQL Editor > New Query, pega el contenido de `supabase-setup.sql` y ejecuta
4. **Copiar claves**: Ve a Settings > API y copia:
   - Project URL
   - anon/public key
5. **Configurar en Vercel**: Ve a tu proyecto en Vercel > Settings > Environment Variables y agrega:
   ```
   VITE_SUPABASE_URL = tu_project_url
   VITE_SUPABASE_ANON_KEY = tu_anon_key
   ```
6. **Re-deploy**: Vercel > Deployments > Redeploy

---

## 📱 Instalar como App en el Celular

### iPhone:
1. Abre la URL en Safari
2. Toca el botón de compartir (cuadrado con flecha)
3. "Agregar a pantalla de inicio"

### Android:
1. Abre la URL en Chrome
2. Toca los 3 puntos (⋮)
3. "Agregar a pantalla de inicio" o "Instalar app"

---

## 🔄 Cómo Actualizar

Cada vez que hagas cambios:
```bash
git add .
git commit -m "descripción del cambio"
git push
```
Vercel detecta el push y actualiza automáticamente en ~30 segundos.

---

## 📁 Estructura del Proyecto

```
splithome/
├── public/              # Archivos estáticos (iconos, favicon)
├── src/
│   ├── components/      # Componentes React
│   │   ├── App.jsx      # App principal con todas las tabs
│   │   ├── AuthScreen.jsx  # Login/Registro
│   │   ├── Forms.jsx    # Formularios de gastos/ingresos
│   │   ├── SetupWizard.jsx # Configuración inicial
│   │   └── UI.jsx       # Componentes reutilizables
│   ├── lib/
│   │   ├── calc.js      # Lógica de cálculos y balances
│   │   ├── constants.js # Categorías, monedas, config
│   │   ├── reducer.js   # Estado de la app
│   │   ├── storage.js   # Capa de datos (local + cloud)
│   │   └── supabase.js  # Cliente Supabase
│   ├── styles/
│   │   └── global.css   # Estilos globales
│   └── main.jsx         # Entry point
├── .env.example         # Template de variables de entorno
├── index.html           # HTML principal
├── package.json
├── supabase-setup.sql   # SQL para crear tabla en Supabase
├── vercel.json          # Config de Vercel
└── vite.config.js       # Config de Vite + PWA
```

---

## 💡 Ideas para Futuras Actualizaciones

- [ ] Exportar datos a Excel/CSV
- [ ] Gráficas mensuales de tendencia
- [ ] Recordatorios de gastos fijos
- [ ] Modo oscuro
- [ ] Compartir lista entre dispositivos con código
- [ ] Fotos de recibos
- [ ] Metas de ahorro

---

## Costos

| Servicio | Costo |
|----------|-------|
| Vercel hosting | **$0** (plan gratuito) |
| Supabase DB | **$0** (hasta 500MB, 50K usuarios) |
| Dominio (si ya tienes) | **$0** |
| **TOTAL** | **$0/mes** |

---

Hecho con ❤️ para familias que quieren controlar sus finanzas juntos.
