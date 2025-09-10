<a href="https://demo-nextjs-with-supabase.vercel.app/">
  <img alt="Next.js and Supabase Starter Kit - the fastest way to build Web3 dApps with Next.js and Supabase" src="https://demo-nextjs-with-supabase.vercel.app/opengraph-image.png">
  <h1 align="center">Next.js and Supabase Starter Kit</h1>
</a>

<p align="center">
 The fastest way to build Web3 dApps with Next.js and Supabase
</p>

<p align="center">
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#demo"><strong>Demo</strong></a> ·
  <a href="#deploy-to-vercel"><strong>Deploy to Vercel</strong></a> ·
  <a href="#clone-and-run-locally"><strong>Clone and run locally</strong></a> ·
  <a href="#feedback-and-issues"><strong>Feedback and issues</strong></a>
  <a href="#more-supabase-examples"><strong>More Examples</strong></a>
</p>
<br/>

## Features

- **Web3-Ready Architecture**: Works across the entire [Next.js](https://nextjs.org) stack for building decentralized applications
  - App Router (perfect for on-chain state management)
  - Pages Router (legacy compatibility for existing dApps)
  - Middleware (enforce Web3 auth guards)
  - Client (wallet connections and smart contract interactions)
  - Server (off-chain computations and API routes)
  - It just works with Web3!
- **Decentralized Authentication**: supabase-ssr package configured for cookie-based auth with Web3 wallet integration
- **Self-Custody Auth**: Password-based authentication with optional crypto wallet support via [Supabase UI Library](https://supabase.com/ui/docs/nextjs/password-based-auth)
- **Permissionless Styling**: Built with [Tailwind CSS](https://tailwindcss.com) for composable, decentralized design systems
- **Composable Components**: [shadcn/ui](https://ui.shadcn.com/) for building reusable Web3 UI primitives
- **Trustless Deployment**: Optional deployment with [Supabase Vercel Integration and Vercel deploy](#deploy-your-own)
  - Environment variables automatically assigned to Vercel project for seamless Web3 config

## Demo

You can view a fully working Web3 dApp demo at [demo-nextjs-with-supabase.vercel.app](https://demo-nextjs-with-supabase.vercel.app/). Experience the future of decentralized application development with seamless auth flows and composable architecture.

## Deploy to Vercel

Launch your Web3 dApp to the decentralized web! Vercel deployment will guide you through creating a Supabase account and project for your trustless backend infrastructure.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so your decentralized application is fully functioning and ready to scale permissionlessly.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project for your decentralized backend - create one [via the Supabase dashboard](https://database.new)

2. Bootstrap your Web3 dApp using the Supabase Starter template:

   ```bash
   npx create-next-app --example with-supabase web3-dapp
   ```

   ```bash
   yarn create next-app --example with-supabase web3-dapp
   ```

   ```bash
   pnpm create next-app --example with-supabase web3-dapp
   ```

3. Navigate to your dApp's directory:

   ```bash
   cd web3-dapp
   ```

4. Configure your decentralized environment by renaming `.env.example` to `.env.local` and updating:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Your Supabase credentials can be found in [your project's API settings](https://supabase.com/dashboard/project/_?showConnect=true) - these power your trustless authentication layer.

5. Launch your local Web3 development environment:

   ```bash
   npm run dev
   ```

   Your decentralized application should now be running permissionlessly on [localhost:3000](http://localhost:3000/).

6. This template ships with composable shadcn/ui components optimized for Web3 UX. For custom styling, remove `components.json` and [re-initialize shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Explore [Supabase Local Development docs](https://supabase.com/docs/guides/getting-started/local-development) to run your entire decentralized stack locally.

## Feedback and issues

Join the decentralized development community! File feedback and issues on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose) to help improve Web3 tooling for everyone.

## More Supabase examples

Explore these decentralized application starters and educational resources:

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments) - Monetize your Web3 dApps with trustless payment flows
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF) - Master decentralized authentication patterns
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs) - Advanced Web3 authentication implementations
