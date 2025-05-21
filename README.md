# Plataforma de Aprendizaje en Línea (PAL)

Sistema de gestión de cursos y contenido educativo desarrollado con Next.js y Spring Boot.

## 🚀 Características

- Gestión de cursos y contenido educativo
- Sistema de usuarios y roles
- Carga y descarga de archivos
- Gestión de categorías
- Sistema de exámenes
- Generación de certificados
- Reportes de progreso

## 🛠️ Tecnologías Utilizadas

### Frontend
- Next.js 14
- TypeScript
- Tailwind CSS
- Shadcn/ui
- React Query

### Backend
- Spring Boot
- Java
- MySQL
- JWT para autenticación

## 📋 Prerrequisitos

- Node.js 18.x o superior
- npm o yarn
- Java 17 o superior
- MySQL 8.x

## 🔧 Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd front
```

2. Instalar dependencias:
```bash
npm install
# o
yarn install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
```
Editar el archivo `.env` con las configuraciones necesarias:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_UPLOAD_MAX_SIZE=10485760
```

4. Iniciar el servidor de desarrollo:
```bash
npm run dev
# o
yarn dev
```

## 📁 Estructura del Proyecto

```
front/
├── app/                    # Directorio principal de la aplicación
│   ├── cursos/            # Páginas relacionadas con cursos
│   ├── examenes/          # Páginas relacionadas con exámenes
│   └── ...
├── components/            # Componentes reutilizables
├── lib/                   # Utilidades y configuración
│   └── api.ts            # Funciones de API
├── public/               # Archivos estáticos
└── styles/              # Estilos globales
```

## 🔄 API Endpoints

### Cursos
- `GET /api/courses/all` - Obtener todos los cursos
- `POST /api/courses/create` - Crear un nuevo curso
- `PUT /api/courses/update/{id}` - Actualizar un curso
- `DELETE /api/courses/delete/{id}` - Eliminar un curso

### Contenido
- `GET /api/content/course/{id}` - Obtener contenido de un curso
- `POST /api/content/update` - Subir nuevo contenido
- `GET /api/content/download/{id}` - Descargar contenido
- `DELETE /api/content/delete/{id}` - Eliminar contenido

### Usuarios
- `GET /api/users/all` - Obtener todos los usuarios
- `POST /api/users/create` - Crear nuevo usuario
- `PUT /api/users/update/{id}` - Actualizar usuario
- `DELETE /api/users/delete/{id}` - Eliminar usuario

## 🚀 Despliegue

1. Construir la aplicación:
```bash
npm run build
# o
yarn build
```

2. Iniciar en producción:
```bash
npm start
# o
yarn start
```

## 📝 Notas Adicionales

- El tamaño máximo de archivo para subida es de 10MB
- Los archivos se almacenan en el servidor backend
- Se recomienda configurar un proxy inverso para producción

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.

## ✨ Agradecimientos

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Shadcn/ui](https://ui.shadcn.com/)
- [Spring Boot](https://spring.io/projects/spring-boot) 