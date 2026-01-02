This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

```
technurx
├─ .env
├─ context
│  └─ SidebarContext.jsx
├─ eslint.config.mjs
├─ jsconfig.json
├─ lib
│  └─ axios.js
├─ middleware.js
├─ next.config.mjs
├─ package-lock.json
├─ package.json
├─ public
│  ├─ favicon.png
│  ├─ file.svg
│  ├─ globe.svg
│  ├─ next.svg
│  ├─ vercel.svg
│  └─ window.svg
├─ README.md
├─ services
│  ├─ address.js
│  ├─ admin
│  │  └─ adminlogin.js
│  ├─ auth.js
│  ├─ devices.js
│  ├─ engineerAuth.js
│  ├─ notification.js
│  └─ repairs.js
└─ src
   ├─ app
   │  ├─ (admin-dashboard)
   │  │  ├─ admin-dashboard
   │  │  │  ├─ admin.css
   │  │  │  └─ page.jsx
   │  │  ├─ layout.jsx
   │  │  └─ test
   │  ├─ (auth)
   │  │  ├─ create-password
   │  │  │  └─ [token]
   │  │  │     └─ page.jsx
   │  │  ├─ forgot-password
   │  │  │  └─ page.jsx
   │  │  ├─ layout.jsx
   │  │  ├─ login
   │  │  │  ├─ login.css
   │  │  │  └─ page.jsx
   │  │  ├─ not-engineer-login
   │  │  │  ├─ englogin.css
   │  │  │  └─ page.jsx
   │  │  ├─ not-even-admin-login
   │  │  │  ├─ adminlogin.css
   │  │  │  └─ page.jsx
   │  │  ├─ register
   │  │  │  ├─ page.jsx
   │  │  │  └─ register.css
   │  │  ├─ service-partner
   │  │  │  ├─ page.jsx
   │  │  │  ├─ service.css
   │  │  │  └─ signup
   │  │  │     └─ page.jsx
   │  │  └─ verify-email
   │  │     ├─ page.jsx
   │  │     └─ verify.css
   │  ├─ (customer-dashboard)
   │  │  ├─ dashboard
   │  │  │  ├─ book-repair
   │  │  │  │  ├─ book.css
   │  │  │  │  ├─ page.jsx
   │  │  │  │  ├─ step2
   │  │  │  │  │  └─ page.jsx
   │  │  │  │  └─ step3
   │  │  │  │     ├─ BookModal.jsx
   │  │  │  │     └─ page.jsx
   │  │  │  ├─ dashboard.css
   │  │  │  ├─ devices
   │  │  │  │  ├─ devices.css
   │  │  │  │  └─ page.jsx
   │  │  │  ├─ feedback
   │  │  │  │  ├─ feedback.css
   │  │  │  │  └─ page.jsx
   │  │  │  ├─ insurance
   │  │  │  │  ├─ dashinsure.css
   │  │  │  │  └─ page.jsx
   │  │  │  ├─ my-account
   │  │  │  │  ├─ page.jsx
   │  │  │  │  └─ settings.css
   │  │  │  ├─ my-orders
   │  │  │  │  ├─ orders.css
   │  │  │  │  └─ page.jsx
   │  │  │  ├─ page.jsx
   │  │  │  └─ payments
   │  │  │     ├─ page.jsx
   │  │  │     └─ payment.css
   │  │  ├─ layout.jsx
   │  │  └─ test
   │  ├─ (engineer-dashboard)
   │  │  ├─ components
   │  │  │  ├─ engnavbar
   │  │  │  └─ engsidebar
   │  │  │     ├─ sidebar.css
   │  │  │     └─ Sidebar.jsx
   │  │  ├─ engineer-dashboard
   │  │  │  ├─ account-setup
   │  │  │  │  ├─ page.jsx
   │  │  │  │  └─ setup.css
   │  │  │  ├─ engineer.css
   │  │  │  └─ page.jsx
   │  │  ├─ layout.jsx
   │  │  └─ test
   │  ├─ (landing-page)
   │  │  ├─ insurance
   │  │  │  ├─ insurance.css
   │  │  │  └─ page.jsx
   │  │  ├─ layout.jsx
   │  │  ├─ page.jsx
   │  │  ├─ partner
   │  │  │  ├─ page.jsx
   │  │  │  └─ partner.css
   │  │  ├─ privacy-policy
   │  │  │  ├─ page.jsx
   │  │  │  └─ privacy.css
   │  │  ├─ terms-conditions
   │  │  │  └─ page.jsx
   │  │  └─ track-repair
   │  │     ├─ page.jsx
   │  │     ├─ track.css
   │  │     └─ TrackModal.jsx
   │  ├─ favicon.ico
   │  ├─ globals.css
   │  ├─ home.css
   │  ├─ layout.jsx
   │  ├─ loader.jsx
   │  ├─ not-found.css
   │  ├─ not-found.jsx
   │  ├─ page.module.css
   │  └─ resolve-role
   │     ├─ page.jsx
   │     └─ resolve.css
   ├─ assets
   │  ├─ fonts
   │  └─ images
   └─ components
      ├─ chatbox
      │  ├─ chatbox.css
      │  └─ Chatbox.jsx
      ├─ CustomToast.jsx
      ├─ dashboard
      │  ├─ DashboardNav.jsx
      │  └─ dashcomp.css
      ├─ FAQ.jsx
      ├─ footer
      │  ├─ footer.css
      │  └─ Footer.jsx
      ├─ gadget.css
      ├─ HeroSection.jsx
      ├─ HomeInsurancePartner.jsx
      ├─ HowBest.jsx
      ├─ navbar
      │  ├─ navbar.css
      │  └─ Navbar.jsx
      ├─ OurServices.jsx
      ├─ Repairs.jsx
      ├─ SelectGadgets.jsx
      ├─ sidebar
      │  ├─ sidebar.css
      │  └─ Sidebar.jsx
      ├─ swiper.css
      ├─ Swiper.jsx
      ├─ Testimonials.jsx
      └─ toast.css

```