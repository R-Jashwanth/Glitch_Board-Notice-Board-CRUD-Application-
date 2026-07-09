# Notice Board CRUD Application

![TypeScript](https://img.shields.io/badge/TypeScript-60.4%25-3178C6?style=flat-square&logo=typescript)
![JavaScript](https://img.shields.io/badge/JavaScript-36.8%25-F7DF1E?style=flat-square&logo=javascript)
![CSS](https://img.shields.io/badge/CSS-2.4%25-1572B6?style=flat-square&logo=css3)
![HTML](https://img.shields.io/badge/HTML-0.4%25-E34C26?style=flat-square&logo=html5)

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=next.js&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=flat-square&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)

A full-stack Notice Board application built as part of the **Reno Platforms Web Development Assignment**. The application supports complete CRUD (Create, Read, Update, Delete) operations for notices.

## Features

- Create new notices
- View all notices in responsive card layout
- Edit existing notices
- Delete notices with confirmation
- Server-side validation
- Urgent notices displayed before Normal notices
- Responsive UI for desktop and mobile
- Prisma ORM integration
- Hosted PostgreSQL database
- API Routes using Next.js Pages Router

## Tech Stack

- **Framework:** Next.js (Pages Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Supabase / Neon / TiDB)
- **ORM:** Prisma
- **Styling:** Tailwind CSS
- **Forms:** React Hook Form
- **Validation:** Server-side validation in API Routes
- **Icons:** Lucide React
- **Animations:** Framer Motion
- **Deployment:** Vercel

## Project Structure

```
notice-board/
│
├── pages/
│   ├── index.tsx
│   ├── notice/
│   │   ├── new.tsx
│   │   └── [id].tsx
│   └── api/
│       └── notices/
│           ├── index.ts
│           └── [id].ts
│
├── components/
│   ├── NoticeCard.tsx
│   ├── NoticeForm.tsx
│   ├── DeleteModal.tsx
│   ├── Layout.tsx
│   └── Navbar.tsx
│
├── lib/
│   └── prisma.ts
│
├── prisma/
│   └── schema.prisma
│
├── styles/
├── public/
├── utils/
└── README.md
```

## Database Schema

```prisma
model Notice {
  id          String   @id @default(uuid())
  title       String
  body        String
  category    String
  priority    String
  publishDate DateTime
  image       String?
  createdAt   DateTime @default(now())
}
```

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="your_database_connection_string"
DIRECT_URL="your_direct_database_connection_string"
```

## Installation

Clone the repository.

```bash
git clone https://github.com/<your-username>/notice-board.git
```

Navigate to the project.

```bash
cd notice-board
```

Install dependencies.

```bash
npm install
```

Generate Prisma Client.

```bash
npx prisma generate
```

Push schema to the database.

```bash
npx prisma db push
```

Run the development server.

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/notices` | Retrieve all notices |
| POST | `/api/notices` | Create a new notice |
| GET | `/api/notices/:id` | Retrieve a notice by ID |
| PUT | `/api/notices/:id` | Update an existing notice |
| DELETE | `/api/notices/:id` | Delete a notice |

## Validation

Server-side validation ensures:

- Title is required
- Body is required
- Category is valid
- Priority is valid
- Publish Date is valid

Invalid requests return appropriate HTTP status codes.

## Deployment

The application is deployed using **Vercel**.

Deployment steps:

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Configure environment variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
4. Deploy the project.

## Future Improvements

- Image upload using cloud storage
- Search functionality
- Category filters
- Pagination
- Authentication and authorization
- Rich text editor
- Dark mode

## AI Usage

AI tools were used to assist with:

- Project planning
- Code suggestions
- Component scaffolding
- Documentation improvements
- Debugging and error resolution

All generated code was reviewed, modified, tested, and integrated manually.

## Author

**Jashwanth R**

B.E. Artificial Intelligence & Data Science

---

This project was developed for the **Reno Platforms Web Development Assignment** and follows the required technology stack of **Next.js Pages Router, Prisma ORM, Hosted PostgreSQL Database, and Vercel Deployment**.
