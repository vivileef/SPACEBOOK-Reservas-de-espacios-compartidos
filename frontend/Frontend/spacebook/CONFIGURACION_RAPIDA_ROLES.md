# ⚡ CONFIGURACIÓN RÁPIDA - Sistema de Roles

## 🎯 Pasos para Activar el Sistema

### 1️⃣ Ejecutar Script SQL en Supabase
```
1. Ir a: https://supabase.com/dashboard
2. Tu Proyecto → SQL Editor → New Query
3. Copiar contenido de: SUPABASE_ADMINISTRADOR_SETUP.sql
4. Pegar y ejecutar (Run)
5. Verificar: "Success"
```

### 2️⃣ Crear Usuarios de Autenticación para Administradores

**IMPORTANTE:** Los administradores necesitan existir en Supabase Auth.

#### Opción A: Desde Dashboard (Recomendado)
```
1. Ir a: Authentication → Users → Add User

Para Stalin Tumbaco:
   Email: stalin2005tumbaco@gmail.com
   Password: [Crear contraseña segura]
   ✅ Confirmar email automáticamente

Para Jose Pacheco:
   Email: giorno2005@outlook.es
   Password: [Crear contraseña segura]
   ✅ Confirmar email automáticamente
```

#### Opción B: Login con Credenciales Existentes
Si los administradores ya tienen cuentas en Supabase Auth, solo asegúrate de que sus correos coincidan con los de la tabla `administrador`.

### 3️⃣ Probar el Sistema

#### Como Administrador:
```
1. http://localhost:4200/login
2. Correo: stalin2005tumbaco@gmail.com (o giorno2005@outlook.es)
3. Password: [La que creaste]
4. Click "Iniciar Sesión"
5. ✅ Debe redirigir a /admin-dashboard (panel ROJO)
```

#### Como Usuario Normal:
```
1. http://localhost:4200/register
2. Completar formulario con datos de prueba
3. Ir a: http://localhost:4200/login
4. Ingresar correo y contraseña del usuario
5. ✅ Debe redirigir a /user-dashboard (panel AZUL)
```

---

## 🔍 Verificación Rápida

### En Supabase Dashboard:

**Tabla administrador:**
```sql
SELECT * FROM administrador;
```
Debe mostrar 2 registros (Stalin y Jose)

**Authentication → Users:**
Debe mostrar los correos:
- stalin2005tumbaco@gmail.com
- giorno2005@outlook.es

---

## 🎨 Diferencias Visuales

### Panel de Administrador (`/admin-dashboard`)
- 🔴 **Color:** Rojo
- 👤 **Identificación:** "Administrador"
- 📊 **Contenido:**
  - Estadísticas del sistema
  - Total de usuarios
  - Espacios activos
  - Reservas del día
  - Ingresos mensuales
  - Acciones administrativas
  - Log de actividad

### Panel de Usuario (`/user-dashboard`)
- 🔵 **Color:** Azul
- 👤 **Identificación:** "Usuario"
- 📊 **Contenido:**
  - Mis reservas
  - Espacios disponibles
  - Próxima reserva
  - Búsqueda de estacionamiento
  - Historial personal

---

## 🆘 Si Algo Sale Mal

### Error: "No provider found for Auth"
**Ya está solucionado** ✅ (agregamos Auth a providers en app.config.ts)

### Error: "Usuario no encontrado"
```
Solución:
1. Verifica que el admin existe en Authentication → Users
2. Verifica que el admin existe en tabla administrador
3. Verifica que los correos coinciden exactamente
```

### Error: "Access denied" o no redirige
```
Solución:
1. Revisa la consola del navegador (F12)
2. Verifica que el correo está en la lista ADMIN_EMAILS
3. Cierra sesión y vuelve a iniciar
```

### Error: "relation 'administrador' does not exist"
```
Solución:
1. Ejecuta el script SUPABASE_ADMINISTRADOR_SETUP.sql
2. Verifica en Table Editor que la tabla existe
```

---

## 📋 Checklist Final

Antes de considerar completo:
- [ ] Script SQL ejecutado en Supabase
- [ ] Tabla `administrador` creada con 2 registros
- [ ] Usuarios de auth creados para ambos administradores
- [ ] Tabla `usuarios` lista (del setup anterior)
- [ ] Login como admin funciona → redirige a `/admin-dashboard`
- [ ] Login como usuario funciona → redirige a `/user-dashboard`
- [ ] Registro de nuevos usuarios funciona
- [ ] Dashboards se visualizan correctamente

---

## 🔗 Archivos de Referencia

1. **SISTEMA_ROLES.md** → Documentación completa del sistema
2. **SUPABASE_ADMINISTRADOR_SETUP.sql** → Script SQL para configurar tabla
3. **CONFIGURACION_RAPIDA_ROLES.md** → Este archivo (guía rápida)

---

## ⏱️ Tiempo Estimado

- Ejecutar SQL: 2 minutos
- Crear usuarios de auth: 3 minutos
- Probar sistema: 5 minutos
- **Total: ~10 minutos**

---

## 🎉 Resultado Final

Después de completar todos los pasos:

✅ Sistema de roles completamente funcional
✅ 2 administradores configurados
✅ Usuarios normales pueden registrarse
✅ Login redirige automáticamente según rol
✅ Dashboards personalizados para cada rol
✅ Protección básica de rutas implementada

**¡Listo para usar!** 🚀
