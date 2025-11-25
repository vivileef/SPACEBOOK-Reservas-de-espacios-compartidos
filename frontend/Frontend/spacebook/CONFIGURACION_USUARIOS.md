# Configuración de Autenticación y Tabla Usuarios

## 📋 Resumen de Cambios

Se ha actualizado el sistema de registro para trabajar con la tabla `usuarios` de tu base de datos en Supabase, conectando el servicio de autenticación (`auth.users`) con tu tabla personalizada.

## 🗃️ Estructura de la Tabla Usuarios

```sql
usuarios (
    usuarioid UUID PRIMARY KEY,
    nombre VARCHAR,
    apellido VARCHAR,
    correo VARCHAR UNIQUE,
    contrasena VARCHAR,
    cedula BIGINT,
    telefono BIGINT,
    fechacreacion TIMESTAMPTZ
)
```

## 🔧 Archivos Actualizados

### 1. **registerComponent.html**
- ✅ Agregados campos: `nombre`, `apellido`, `cedula`, `telefono`
- ✅ Diseño responsive con grid de 2 columnas
- ✅ Validaciones visuales para cada campo
- ✅ Indicadores de campos requeridos (*)

### 2. **registerComponent.ts**
- ✅ FormGroup actualizado con todos los campos de la tabla
- ✅ Validaciones para cada campo:
  - Nombre y Apellido: mínimo 2 caracteres
  - Correo: formato email válido
  - Cédula y Teléfono: campos numéricos requeridos
  - Contraseña: mínimo 6 caracteres

### 3. **auth.service.ts**
- ✅ Interface `UserProfile` actualizada para reflejar la estructura de `usuarios`
- ✅ Método `signUp()` modificado para:
  - Crear usuario en `auth.users`
  - Insertar datos en tabla `usuarios`
  - Guardar todos los campos requeridos
- ✅ Métodos `getProfile()` y `updateProfile()` actualizados para usar `usuarios`

## 📝 Configuración en Supabase

### Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto en Supabase: https://supabase.com/dashboard
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **"SQL Editor"**
4. Haz clic en **"New query"**
5. Abre el archivo `SUPABASE_USUARIOS_SETUP.sql` que está en la raíz del proyecto
6. Copia todo el contenido y pégalo en el editor
7. Haz clic en **"Run"** o presiona `Ctrl + Enter`
8. Verifica que aparezca el mensaje "Success"

### Paso 2: Verificar las Políticas RLS

Las políticas RLS (Row Level Security) configuradas según tu imagen son:

```sql
✅ Los usuarios pueden ver su propio registro (SELECT)
✅ Los usuarios pueden actualizar su propio registro (UPDATE)
✅ Los usuarios pueden insertar su propio registro (INSERT)
✅ Los usuarios pueden eliminar su propio registro (DELETE)
```

**Importante:** En tu imagen veo que RLS está **deshabilitado** (RLS Disabled). Las políticas están creadas pero no se aplicarán hasta que habilites RLS. Para mantener la seguridad:

**Opción A - Mantener RLS Deshabilitado (menos seguro pero más simple):**
- No cambies nada, el sistema funcionará
- Cualquier usuario autenticado puede ver/editar cualquier registro

**Opción B - Habilitar RLS (recomendado para producción):**
1. En Supabase Dashboard, ve a **Table Editor**
2. Selecciona la tabla `usuarios`
3. Haz clic en el ícono de configuración (⚙️)
4. Habilita **"Enable Row Level Security"**
5. Las políticas ya estarán aplicadas automáticamente

## 🔄 Flujo de Registro

```mermaid
Usuario → Formulario Registro → Angular Service → Supabase Auth → Tabla usuarios
```

**Detalle del proceso:**

1. **Usuario completa el formulario** con: nombre, apellido, correo, cédula, teléfono, contraseña
2. **Angular valida los datos** en el frontend
3. **Se llama a `signUp()`** en `auth.service.ts`
4. **Supabase Auth crea el usuario** en `auth.users`
5. **El servicio inserta los datos** en la tabla `usuarios`
6. **Se redirige al login** para que el usuario inicie sesión

## 🔐 Seguridad

- ✅ La contraseña se maneja a través de Supabase Auth (encriptada)
- ✅ NO se guarda la contraseña en texto plano en la tabla `usuarios`
- ✅ El campo `contrasena` en la tabla se deja vacío (por seguridad)
- ✅ RLS permite que cada usuario solo vea/edite su propio registro
- ✅ La cédula y el correo son únicos (evita duplicados)

## 🧪 Prueba el Sistema

1. Ejecuta el proyecto:
   ```bash
   cd Frontend/spacebook
   npm install
   ng serve
   ```

2. Navega a: `http://localhost:4200/register`

3. Completa el formulario con datos de prueba:
   - Nombre: Juan
   - Apellido: Pérez
   - Correo: juan.perez@test.com
   - Cédula: 1234567890
   - Teléfono: 0987654321
   - Contraseña: test123

4. Verifica en Supabase Dashboard:
   - Tabla `usuarios`: debe aparecer el nuevo registro
   - Authentication → Users: debe aparecer el usuario con el correo

## ❓ Preguntas Frecuentes

**P: ¿Por qué el campo `contrasena` está vacío en la tabla?**  
R: Por seguridad. Supabase Auth maneja las contraseñas de forma encriptada. No es necesario (ni recomendable) guardar la contraseña en la tabla personalizada.

**P: ¿Qué pasa si el trigger falla?**  
R: El servicio de Angular inserta manualmente en la tabla `usuarios`, así que siempre se guardará la información.

**P: ¿Cómo elimino un usuario?**  
R: Debes eliminarlo de dos lugares:
1. Authentication → Users (en Supabase Dashboard)
2. Tabla `usuarios` (se puede hacer automático con otro trigger)

**P: ¿Puedo agregar más campos?**  
R: Sí, solo necesitas:
1. Agregar el campo en la tabla `usuarios`
2. Agregarlo al formulario en `registerComponent.html`
3. Agregarlo al FormGroup en `registerComponent.ts`
4. Agregarlo al método `signUp()` en `auth.service.ts`

## 📚 Recursos Adicionales

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Angular Reactive Forms](https://angular.dev/guide/forms/reactive-forms)

## ✅ Checklist de Implementación

- [x] Actualizar formulario HTML con todos los campos
- [x] Actualizar FormGroup en TypeScript
- [x] Modificar servicio de autenticación
- [x] Actualizar interface UserProfile
- [x] Crear script SQL para Supabase
- [ ] **Ejecutar script SQL en Supabase Dashboard**
- [ ] **Verificar políticas RLS**
- [ ] **Probar registro de nuevo usuario**
- [ ] **Verificar datos en tabla usuarios**

---

**¿Necesitas ayuda adicional?** 
Si tienes algún error o pregunta durante la configuración, házmelo saber con el mensaje de error específico.
