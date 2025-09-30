import { ProgressNav } from '@/components/guide/ProgressNav'
import { StepSection } from '@/components/guide/StepSection'
import { CursorPrompt } from '@/components/guide/CursorPrompt'
import { EncouragementBadge } from '@/components/guide/EncouragementBadge'

export const metadata = {
  title: 'Complete Setup Guide | DevDapp Web3 Starter',
  description: 'Deploy a complete multi-chain Web3 dApp in under 60 minutes using Cursor AI. Copy-paste prompts, no coding required.',
}

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900">
      <ProgressNav />
      
      <main className="lg:ml-80">
        {/* Welcome Section */}
        <StepSection id="welcome" title="Welcome!" emoji="👋" estimatedTime="2 min">
          <div className="space-y-6">
            <div className="text-lg">
              <p className="mb-4">
                You&apos;re about to deploy a <strong>production-ready multi-chain Web3 dApp</strong> in under 60 minutes!
              </p>
              <p className="mb-4">
                This guide uses <strong>Cursor AI</strong> to handle all the technical setup. You&apos;ll copy natural language prompts into Cursor, and it will execute all the platform-specific commands for you.
              </p>
            </div>

            {/* What You'll Build */}
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-6">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">What You&apos;ll Build 🏗️</h3>
              <ul className="space-y-2 text-blue-800 dark:text-blue-200">
                <li>✅ Full-stack Web3 application with user authentication</li>
                <li>✅ Support for 6+ blockchains (Avalanche, Flow, Tezos, ApeChain, Stacks, ROOT)</li>
                <li>✅ Live on the internet via Vercel</li>
                <li>✅ Backend database with Supabase</li>
                <li>✅ Email confirmation flow</li>
                <li>✅ User profiles with image upload</li>
                <li>✅ Mobile-responsive design</li>
              </ul>
            </div>

            {/* Prerequisites */}
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30 p-6">
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">Prerequisites ✓</h3>
              <ul className="space-y-2 text-purple-800 dark:text-purple-200">
                <li>☑️ A computer (Mac, Windows, or Linux)</li>
                <li>☑️ <strong>Cursor AI installed</strong> - <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-purple-600">Download here</a></li>
                <li>☑️ Internet connection</li>
                <li>☑️ Email address</li>
                <li>☑️ That&apos;s it! Cursor handles everything else.</li>
              </ul>
            </div>

            {/* How It Works */}
            <div className="rounded-xl border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-6">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">How It Works 🔄</h3>
              <ol className="space-y-3 text-green-800 dark:text-green-200 list-decimal list-inside">
                <li>Each step shows a <strong>Cursor AI Prompt</strong> in a blue box</li>
                <li>Click <strong>&quot;Copy&quot;</strong> to copy the prompt</li>
                <li>Open Cursor AI chat (<kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">Cmd+L</kbd> or <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">Ctrl+L</kbd>)</li>
                <li>Paste the prompt and press <kbd className="px-2 py-1 bg-white dark:bg-gray-800 rounded">Enter</kbd></li>
                <li>Cursor AI does the work - approve commands when asked</li>
                <li>Move to the next step!</li>
              </ol>
            </div>

            <EncouragementBadge 
              message="You're about to join thousands of developers building the future of Web3. Cursor AI is your co-pilot! 🚀" 
              variant="milestone"
            />
          </div>
        </StepSection>

        {/* Step 1: Install Git */}
        <StepSection id="git" title="Install & Setup Git" emoji="📦" estimatedTime="5 min">
          <p className="mb-4">
            Git is the version control system that powers modern software development. Let&apos;s get it installed and configured on your machine.
          </p>

          <CursorPrompt 
            prompt='Install Git for me and ensure my Git credentials have read write access on this machine. Set my Git username to &quot;YourName&quot; and email to &quot;your.email@example.com&quot;. Then verify Git is working correctly.'
          />

          <div className="my-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Important:</strong> Replace <code>&quot;YourName&quot;</code> and <code>&quot;your.email@example.com&quot;</code> with your actual name and email before copying!
            </p>
          </div>

          <div className="mt-6 space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>What Cursor will do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Detect your operating system (Mac/Windows/Linux)</li>
              <li>Install Git using the appropriate method</li>
              <li>Configure your Git credentials</li>
              <li>Verify the installation</li>
              <li>Handle any errors automatically</li>
            </ul>
          </div>

          <EncouragementBadge 
            message="Great job! Git is the foundation of modern development. You're 8% done! 🎉" 
            variant="success"
          />
        </StepSection>

        {/* Step 2: Setup GitHub */}
        <StepSection id="github" title="Setup GitHub Account & SSH" emoji="🐙" estimatedTime="7 min">
          <p className="mb-4">
            GitHub is where we&apos;ll store your code and collaborate. Let&apos;s create an account and set up secure SSH authentication.
          </p>

          <div className="my-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Manual Step First:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Visit <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="underline">https://github.com/signup</a></li>
              <li>Create account with your email</li>
              <li>Verify your email</li>
              <li>Keep GitHub open for next step</li>
            </ol>
          </div>

          <CursorPrompt 
            prompt='Generate an SSH key for my GitHub account using my email &quot;your.email@example.com&quot;, add it to the SSH agent, copy the public key to my clipboard, and give me instructions on how to add it to GitHub. Then test the SSH connection to GitHub.'
          />

          <div className="mt-6 space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>After Cursor generates the key:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Your SSH public key will be copied to clipboard</li>
              <li>Go to <a href="https://github.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline">https://github.com/settings/keys</a></li>
              <li>Click &quot;New SSH key&quot;</li>
              <li>Paste the key and click &quot;Add SSH key&quot;</li>
              <li>Tell Cursor &quot;done&quot; to test the connection</li>
            </ol>
          </div>

          <EncouragementBadge 
            message="You're connected to GitHub! You now have access to millions of open-source projects. 15% complete! 🔥" 
            variant="success"
          />
        </StepSection>

        {/* Step 3: Install Node.js */}
        <StepSection id="node" title="Install Node.js & npm" emoji="⚡" estimatedTime="3 min">
          <p className="mb-4">
            Node.js is the JavaScript runtime that powers this application. npm is the package manager that installs all the dependencies.
          </p>

          <CursorPrompt 
            prompt='Install the latest LTS version of Node.js and npm on my system. Then verify both are installed correctly and show me the versions.'
          />

          <div className="mt-6 space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>What Cursor will do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Detect your OS</li>
              <li>Install Node.js LTS version</li>
              <li>Install npm automatically</li>
              <li>Verify installations</li>
              <li>Display versions (should be Node 18+ and npm 9+)</li>
            </ul>
          </div>

          <EncouragementBadge 
            message="Node.js powers millions of websites including Netflix and PayPal. You've got the tools! 23% done! ⚡" 
            variant="success"
          />
        </StepSection>

        {/* Step 4: Fork Repository */}
        <StepSection id="fork" title="Fork the Repository" emoji="🍴" estimatedTime="2 min">
          <p className="mb-4">
            Forking creates your own copy of the codebase that you can customize and deploy.
          </p>

          <div className="my-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Manual Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Visit <a href="https://github.com/YOUR-ORG/vercel-supabase-web3" target="_blank" rel="noopener noreferrer" className="underline">the repository</a></li>
              <li>Click the <strong>&quot;Fork&quot;</strong> button (top right)</li>
              <li>Wait for fork to complete</li>
              <li>Copy your fork&apos;s URL: <code className="bg-white dark:bg-gray-800 px-2 py-1 rounded">https://github.com/YOUR-USERNAME/vercel-supabase-web3</code></li>
            </ol>
          </div>

          <div className="my-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>✓ Keep this URL handy</strong> - you&apos;ll need it in the next step!
            </p>
          </div>

          <EncouragementBadge 
            message="You now have your own copy of the codebase! You can customize it however you want! 31% complete! 🧠" 
            variant="success"
          />
        </StepSection>

        {/* Step 5: Clone Repository */}
        <StepSection id="clone" title="Clone & Setup Repository" emoji="📥" estimatedTime="5 min">
          <p className="mb-4">
            Now let&apos;s download the code to your computer and install all the dependencies.
          </p>

          <CursorPrompt 
            prompt='Clone the GitHub repository from https://github.com/YOUR-USERNAME/vercel-supabase-web3.git into my Documents folder. Then navigate into the project directory, install all npm dependencies, and open the project in Cursor.'
          />

          <div className="my-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Remember:</strong> Replace <code>YOUR-USERNAME</code> with your actual GitHub username!
            </p>
          </div>

          <div className="mt-6 space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>What Cursor will do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Clone your forked repository</li>
              <li>Navigate into the project directory</li>
              <li>Run <code>npm install</code> (may take 2-3 minutes)</li>
              <li>Open the project in Cursor IDE</li>
            </ul>
          </div>

          <EncouragementBadge 
            message="You now have a complete multi-chain Web3 framework on your machine! 38% there! 🎯" 
            variant="success"
          />
        </StepSection>

        {/* Step 6: Deploy to Vercel */}
        <StepSection id="vercel" title="Setup Vercel & Deploy" emoji="▲" estimatedTime="10 min">
          <p className="mb-4">
            Vercel will host your app and make it accessible on the internet. Let&apos;s deploy!
          </p>

          <div className="my-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Manual Step First:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Visit <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="underline">https://vercel.com/signup</a></li>
              <li>Sign up with GitHub</li>
              <li>Authorize Vercel to access your repositories</li>
            </ol>
          </div>

          <CursorPrompt 
            prompt='Install the Vercel CLI globally, authenticate with my Vercel account, then deploy this project to Vercel production. Accept all default settings and show me the deployment URL when finished.'
          />

          <div className="mt-6 space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>What will happen:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Cursor installs Vercel CLI</li>
              <li>Opens browser for you to authorize</li>
              <li>Deploys your app (takes 2-3 minutes)</li>
              <li>Shows your live URL (like <code>https://your-app.vercel.app</code>)</li>
            </ol>
          </div>

          <div className="my-4 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>✓ Save your deployment URL!</strong> You&apos;ll need it later.
            </p>
          </div>

          <EncouragementBadge 
            message="Your app is LIVE on the internet! Anyone in the world can access it! 46% complete! 🌍" 
            variant="milestone"
          />
        </StepSection>

        {/* Step 7: Setup Supabase */}
        <StepSection id="supabase" title="Setup Supabase Account" emoji="🗄️" estimatedTime="5 min">
          <p className="mb-4">
            Supabase provides your database, authentication, and file storage - all in one platform.
          </p>

          <div className="my-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Manual Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>Visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline">https://supabase.com</a></li>
              <li>Click &quot;Start your project&quot;</li>
              <li>Sign up with GitHub</li>
              <li>Create new organization (if needed)</li>
              <li>Click &quot;New project&quot;</li>
              <li>Fill in:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li><strong>Project name:</strong> <code>devdapp-web3</code></li>
                  <li><strong>Database password:</strong> Generate a strong one (SAVE THIS!)</li>
                  <li><strong>Region:</strong> Choose closest to you</li>
                </ul>
              </li>
              <li>Click &quot;Create new project&quot;</li>
              <li>Wait 2-3 minutes for initialization</li>
              <li>Go to <strong>Settings → API</strong></li>
              <li>Keep this tab open for next step</li>
            </ol>
          </div>

          <EncouragementBadge 
            message="Supabase is your backend superpower! Database, auth, storage - all handled! 54% done! 🔋" 
            variant="success"
          />
        </StepSection>

        {/* Step 8: Environment Variables */}
        <StepSection id="env" title="Configure Environment Variables" emoji="🔐" estimatedTime="5 min">
          <p className="mb-4">
            Let&apos;s connect your Vercel frontend to your Supabase backend using environment variables.
          </p>

          <div className="my-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Get Supabase Credentials:</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-800 dark:text-blue-200">
              <li>In Supabase dashboard, go to <strong>Settings → API</strong></li>
              <li>Copy <strong>Project URL</strong> (starts with <code>https://</code>)</li>
              <li>Copy <strong>anon public key</strong> (starts with <code>eyJ...</code>)</li>
              <li>Keep these handy</li>
            </ol>
          </div>

          <CursorPrompt 
            prompt='Add environment variables to my Vercel project for Supabase integration. Set NEXT_PUBLIC_SUPABASE_URL to "YOUR_SUPABASE_URL" and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY to "YOUR_ANON_KEY". Apply to all environments (production, preview, development), then redeploy the app to production.'
          />

          <div className="my-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Important:</strong> Replace the placeholder values with your actual Supabase URL and anon key before copying!
            </p>
          </div>

          <EncouragementBadge 
            message="Your frontend and backend are now connected! The magic is happening! 62% complete! ✨" 
            variant="success"
          />
        </StepSection>

        {/* Step 9: Setup Database */}
        <StepSection id="database" title="Setup Database with SQL" emoji="🗃️" estimatedTime="10 min">
          <p className="mb-4">
            Now let&apos;s create the database schema for user authentication, profiles, and file storage.
          </p>

          <CursorPrompt 
            prompt='Read the complete SQL setup script from docs/profile/SETUP.md in this project. Then give me clear step-by-step instructions on how to execute it in my Supabase SQL Editor, including the exact steps to open the editor and run the script. Show me the actual SQL I need to copy.'
          />

          <div className="mt-6 space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>After Cursor provides the SQL:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Open your Supabase dashboard</li>
              <li>Click <strong>&quot;SQL Editor&quot;</strong> in sidebar</li>
              <li>Click <strong>&quot;New query&quot;</strong></li>
              <li>Copy the SQL script Cursor showed you</li>
              <li>Paste into the SQL Editor</li>
              <li>Click <strong>&quot;Run&quot;</strong> (or press Cmd/Ctrl + Enter)</li>
              <li>Wait for success message</li>
            </ol>
          </div>

          <div className="my-6 p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">
              <strong>✓ Look for:</strong> &quot;🎉 DATABASE SETUP COMPLETE!&quot; message in the results
            </p>
          </div>

          <EncouragementBadge 
            message="Your database is production-ready with enterprise security! You're a database admin now! 70% complete! 🗄️" 
            variant="success"
          />
        </StepSection>

        {/* Step 10: Configure Email */}
        <StepSection id="email" title="Configure Email Authentication" emoji="📧" estimatedTime="5 min">
          <p className="mb-4">
            Enable email signup and confirmation so users can create accounts.
          </p>

          <CursorPrompt 
            prompt='Give me step-by-step instructions to configure email authentication in Supabase. I need to set the Site URL to my Vercel deployment URL &quot;YOUR_VERCEL_URL&quot;, add the necessary redirect URLs for auth callback and confirmation, and update the email confirmation template. Show me exactly what settings to change and what template HTML to use.'
          />

          <div className="my-4 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>⚠️ Replace</strong> <code>YOUR_VERCEL_URL</code> with your actual Vercel deployment URL from Step 6!
            </p>
          </div>

          <div className="mt-6 space-y-2 text-gray-700 dark:text-gray-300">
            <p><strong>After Cursor provides instructions:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Go to <strong>Authentication → Settings</strong> in Supabase</li>
              <li>Set <strong>Site URL</strong> to your Vercel URL</li>
              <li>Add <strong>Redirect URLs</strong> that Cursor provides</li>
              <li>Go to <strong>Authentication → Email Templates</strong></li>
              <li>Click &quot;Confirm signup&quot;</li>
              <li>Replace with the HTML template Cursor showed</li>
              <li>Save changes</li>
            </ol>
          </div>

          <EncouragementBadge 
            message="Email authentication is ready! Users can now sign up and get verified! 85% there! 📧" 
            variant="success"
          />
        </StepSection>

        {/* Step 11: Test Everything */}
        <StepSection id="test" title="Test Everything" emoji="✅" estimatedTime="5 min">
          <p className="mb-4">
            Let&apos;s verify your complete setup works end-to-end!
          </p>

          <CursorPrompt 
            prompt='Open my deployed Vercel app in a browser and guide me through testing the complete authentication flow. Include signing up with a test email, checking for confirmation email, verifying the profile works, and testing the blockchain pages.'
          />

          <div className="my-6 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Testing Checklist:</p>
            <ul className="space-y-1 text-blue-800 dark:text-blue-200">
              <li>✅ Visit live site opens correctly</li>
              <li>✅ Navigate to <code>/auth/sign-up</code></li>
              <li>✅ Sign up with test email (use <a href="https://mailinator.com" target="_blank" rel="noopener noreferrer" className="underline">mailinator.com</a>)</li>
              <li>✅ Receive confirmation email</li>
              <li>✅ Click confirmation link redirects to profile</li>
              <li>✅ Profile page loads and is editable</li>
              <li>✅ Blockchain pages work (<code>/avalanche</code>, <code>/flow</code>, etc.)</li>
              <li>✅ Dark/light mode toggle works</li>
              <li>✅ Mobile responsive design works</li>
            </ul>
          </div>

          <div className="my-6 p-4 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">If Something Doesn&apos;t Work:</p>
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Ask Cursor: <code>&quot;The [specific feature] isn&apos;t working. Help me troubleshoot by checking the relevant configuration and logs.&quot;</code>
            </p>
          </div>

          <EncouragementBadge 
            message="🎉 CONGRATULATIONS! You've deployed a complete Web3 platform! 92% COMPLETE! 🏆" 
            variant="milestone"
          />
        </StepSection>

        {/* Step 12: What's Next */}
        <StepSection id="next" title="What&apos;s Next?" emoji="🚀" estimatedTime="Ongoing">
          <p className="mb-6 text-lg">
            You now have a production-ready multi-chain Web3 dApp! Here&apos;s how to continue your journey:
          </p>

          <div className="space-y-6">
            {/* Customize Branding */}
            <div className="rounded-xl border-2 border-purple-200 bg-purple-50 dark:border-purple-800 dark:bg-purple-950/30 p-6">
              <h3 className="text-xl font-bold text-purple-900 dark:text-purple-100 mb-3">1. Customize Your Branding 🎨</h3>
              <CursorPrompt 
                prompt='Help me customize the branding of my Web3 app. Show me how to update the site title, description, colors, and logo. Point me to the specific files I need to edit.'
                title="Cursor Prompt: Customize Branding"
              />
            </div>

            {/* Add Features */}
            <div className="rounded-xl border-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30 p-6">
              <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3">2. Add Custom Features 💡</h3>
              <CursorPrompt 
                prompt='I want to add [describe your feature] to my app. Help me implement this feature using the existing codebase structure and best practices.'
                title="Cursor Prompt: Add Features"
              />
            </div>

            {/* Custom Domain */}
            <div className="rounded-xl border-2 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30 p-6">
              <h3 className="text-xl font-bold text-green-900 dark:text-green-100 mb-3">3. Deploy a Custom Domain 🌐</h3>
              <CursorPrompt 
                prompt='Help me connect a custom domain to my Vercel deployment. Guide me through purchasing a domain (if needed) and configuring DNS settings.'
                title="Cursor Prompt: Custom Domain"
              />
            </div>

            {/* Learn Codebase */}
            <div className="rounded-xl border-2 border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30 p-6">
              <h3 className="text-xl font-bold text-orange-900 dark:text-orange-100 mb-3">4. Understand the Codebase 📚</h3>
              <CursorPrompt 
                prompt='Give me a tour of this codebase. Explain the folder structure, key files, and how the different parts work together.'
                title="Cursor Prompt: Codebase Tour"
              />
            </div>

            {/* Web3 Integration */}
            <div className="rounded-xl border-2 border-pink-200 bg-pink-50 dark:border-pink-800 dark:bg-pink-950/30 p-6">
              <h3 className="text-xl font-bold text-pink-900 dark:text-pink-100 mb-3">5. Add Web3 Wallet Integration 🔗</h3>
              <CursorPrompt 
                prompt='Help me integrate Web3 wallet connection (MetaMask, WalletConnect) into my app. Show me where to add the code and how to test it.'
                title="Cursor Prompt: Wallet Integration"
              />
            </div>

            {/* Resources */}
            <div className="rounded-xl border-2 border-indigo-200 bg-indigo-50 dark:border-indigo-800 dark:bg-indigo-950/30 p-6">
              <h3 className="text-xl font-bold text-indigo-900 dark:text-indigo-100 mb-3">📚 Resources to Explore</h3>
              <ul className="space-y-2 text-indigo-800 dark:text-indigo-200">
                <li>📚 <a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">Next.js Documentation</a></li>
                <li>🗄️ <a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">Supabase Documentation</a></li>
                <li>🎨 <a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">Tailwind CSS Documentation</a></li>
                <li>🔗 <a href="https://web3js.readthedocs.io/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">Web3.js Documentation</a></li>
                <li>💎 <a href="https://docs.ethers.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-indigo-600">Ethers.js Documentation</a></li>
              </ul>
            </div>

            {/* Community */}
            <div className="rounded-xl border-2 border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-950/30 p-6">
              <h3 className="text-xl font-bold text-teal-900 dark:text-teal-100 mb-3">🤝 Join the Community</h3>
              <ul className="space-y-2 text-teal-800 dark:text-teal-200">
                <li>⭐ Star the repo on GitHub</li>
                <li>🐛 Report issues or suggest features</li>
                <li>🤝 Contribute improvements</li>
                <li>💬 Help other developers in discussions</li>
              </ul>
            </div>
          </div>

          <EncouragementBadge 
            message="🎉 You're now a Web3 developer! You have the foundation to build the next generation of decentralized applications. Cursor AI is your partner for the journey ahead. Welcome to the future! 🚀🌟" 
            variant="milestone"
          />

          <div className="mt-8 text-center">
            <div className="inline-block rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-1">
              <div className="rounded-xl bg-white dark:bg-gray-950 px-8 py-6">
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Achievement Unlocked
                </p>
                <p className="text-5xl font-black text-gray-900 dark:text-white">
                  100% COMPLETE! 🏆
                </p>
              </div>
            </div>
          </div>
        </StepSection>
      </main>
    </div>
  )
}
