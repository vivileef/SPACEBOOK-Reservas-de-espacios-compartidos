# 🎯 GUÍA RÁPIDA - Configuración en 5 Minutos

## ⚡ PASO 1: Ejecutar Script SQL

### 1.1 Abrir Supabase Dashboard
```
🌐 https://supabase.com/dashboard
```

### 1.2 Ir al SQL Editor
```
Dashboard → [Tu Proyecto] → SQL Editor (menú izquierdo) → New Query
```

### 1.3 Copiar y Ejecutar Script
```
📄 Abrir: SUPABASE_USUARIOS_SETUP.sql
📋 Copiar todo el contenido
📝 Pegar en SQL Editor
▶️  Click "Run" o Ctrl+Enter
```

### 1.4 Verificar Resultado
```
✅ Debe aparecer: "Success. No rows returned"
❌ Si hay error, revisa la estructura de tu tabla usuarios
```

---

## ⚡ PASO 2: Verificar Configuración

### 2.1 Revisar Tabla usuarios
```
Dashboard → Table Editor → usuarios
```

**Verificar columnas:**
```
✓ usuarioid (uuid)
✓ nombre (varchar)
✓ apellido (varchar)
✓ correo (varchar)
✓ contrasena (varchar)
✓ cedula (int8)
✓ telefono (int8)
✓ fechacreacion (timestamptz)
```

### 2.2 Verificar Políticas RLS
```
Dashboard → Authentication → Policies → usuarios
```

**Debe mostrar 4 políticas:**
```
✓ SELECT   - Los usuarios pueden ver su propio registro
✓ UPDATE   - Los usuarios pueden actualizar su propio registro
✓ INSERT   - Los usuarios pueden insertar su propio registro
✓ DELETE   - Los usuarios pueden eliminar su propio registro
```

---

## ⚡ PASO 3: Probar el Sistema

### 3.1 Iniciar Aplicación
```bash
cd Frontend/spacebook
npm install
ng serve
```

### 3.2 Abrir Navegador
```
🌐 http://localhost:4200/register
```

### 3.3 Completar Formulario
```
Nombre:      Juan
Apellido:    Pérez
Correo:      juan.perez@test.com
Cédula:      1234567890
Teléfono:    987654321
Contraseña:  test123
```

### 3.4 Click en "Crear Cuenta"
```
⏳ Esperar mensaje: "⏳ Creando cuenta..."
✅ Redirección automática a /login
```

---

## ⚡ PASO 4: Verificar en Supabase

### 4.1 Verificar en Authentication
```
Dashboard → Authentication → Users
```
**Debe aparecer:**
```
Email: juan.perez@test.com
Created: Hace pocos segundos
```

### 4.2 Verificar en Tabla usuarios
```
Dashboard → Table Editor → usuarios
```
**Debe aparecer nuevo registro:**
```
usuarioid:    [UUID generado]
nombre:       Juan
apellido:     Pérez
correo:       juan.perez@test.com
cedula:       1234567890
telefono:     987654321
contrasena:   [vacío]
fechacreacion: [timestamp actual]
```

---

## ⚡ PASO 5: Probar Login

### 5.1 Ir a Login
```
🌐 http://localhost:4200/login
```

### 5.2 Iniciar Sesión
```
Correo:      juan.perez@test.com
Contraseña:  test123
```

### 5.3 Click en "Iniciar Sesión"
```
✅ Debe redirigir al dashboard
✅ Usuario autenticado correctamente
```

---

## 🎊 ¡LISTO!

Tu sistema está completamente configurado y funcionando.

---

## 🆘 Solución de Problemas Rápidos

### ❌ Error: "relation 'usuarios' does not exist"
```
Solución: La tabla usuarios no existe o tiene otro nombre
1. Ve a Table Editor y verifica el nombre exacto
2. Si es diferente, actualiza auth.service.ts línea donde dice .from('usuarios')
```

### ❌ Error: "column does not exist"
```
Solución: Alguna columna tiene nombre diferente
1. Ve a Table Editor → usuarios
2. Verifica los nombres exactos de las columnas
3. Actualiza auth.service.ts con los nombres correctos
```

### ❌ Error: "new row violates row-level security policy"
```
Solución: Las políticas RLS están bloqueando el INSERT
Opción A (temporal): Deshabilitar RLS
  1. Table Editor → usuarios → Settings
  2. Disable Row Level Security
Opción B (recomendado): Ejecutar el script SQL completo
  1. El script crea las políticas correctas
```

### ❌ Error: "Email rate limit exceeded"
```
Solución: Has intentado registrar muchos usuarios rápidamente
1. Espera 1 hora
2. O usa correos diferentes
```

### ❌ Error: "User already registered"
```
Solución: El correo ya está en uso
1. Usa un correo diferente
2. O elimina el usuario anterior de Authentication
```

---

## 📞 ¿Aún Tienes Problemas?

Proporciona:
1. ✉️ Mensaje de error exacto
2. 🖼️ Captura de pantalla (si es posible)
3. 📍 Paso donde ocurrió el error

---

## 📚 Archivos de Referencia

```
📄 SUPABASE_USUARIOS_SETUP.sql     → Script SQL completo
📄 CONFIGURACION_USUARIOS.md       → Documentación técnica detallada
📄 RESUMEN_CAMBIOS.md              → Resumen de todos los cambios
📄 GUIA_RAPIDA.md                  → Este archivo (configuración rápida)
```

---

## 🔍 Comandos Útiles

### Ver logs en tiempo real
```bash
# En la consola del navegador (F12)
# Los logs de registro aparecerán aquí
```

### Limpiar caché de Angular
```bash
ng cache clean
npm start
```

### Reinstalar dependencias
```bash
rm -rf node_modules package-lock.json
npm install
```

---

**Tiempo estimado total: ⏱️ 5-10 minutos**

¡Éxito! 🎉
