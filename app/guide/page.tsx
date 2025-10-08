import { ProgressNav } from '@/components/guide/ProgressNav'
import { StepSection } from '@/components/guide/StepSection'
import { CursorPrompt } from '@/components/guide/CursorPrompt'
import { GlobalNav } from '@/components/navigation/global-nav'
import { GuideLockedView } from '@/components/guide/GuideLockedView'
import { createClient } from '@/lib/supabase/server'
import { AuthButton } from '@/components/auth-button'
import { EnvVarWarning } from '@/components/env-var-warning'
import { hasEnvVars } from '@/lib/utils'

export const metadata = {
  title: 'Complete Setup Guide | DevDapp Web3 Starter',
  description: 'Deploy a complete multi-chain Web3 dApp in under 60 minutes using Cursor AI. Copy-paste prompts, no coding required.',
}

export default async function GuidePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()
  const isAuthenticated = !!data?.claims

  // Show locked view for non-authenticated users
  if (!isAuthenticated) {
    return (
      <>
        <GlobalNav 
          showHomeButton={true} 
          showAuthButton={true} 
          authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />}
        />
        <GuideLockedView />
      </>
    )
  }

  // Show full guide for authenticated users
  return (
    <div className="min-h-screen bg-background">
      <GlobalNav 
        showHomeButton={true} 
        showAuthButton={true} 
        authButtonComponent={!hasEnvVars ? <EnvVarWarning /> : <AuthButton showGuideButton={true} />} 
      />
      <ProgressNav />
      
      <main className="w-full md:w-auto md:ml-80 pt-20 md:pt-16 px-0 overflow-hidden">
        {/* Welcome Section */}
        <StepSection id="welcome" title="Welcome" emoji="👋" estimatedTime="2 min">
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
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">What You&apos;ll Build</h3>
              <ul className="space-y-2 text-muted-foreground">
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
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">Prerequisites</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>☑️ <strong>Cursor AI</strong> - <a href="https://cursor.sh" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Download here</a></li>
                <li>☑️ <strong>Mac</strong> (preferred OS)</li>
                <li>☑️ <strong>GitHub Account</strong></li>
                <li>☑️ <strong>Vercel Account</strong></li>
                <li>☑️ <strong>Supabase Account</strong></li>
              </ul>
            </div>

            {/* How It Works */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">How It Works</h3>
              <ol className="space-y-3 text-muted-foreground list-decimal list-inside">
                <li>Each step shows a <strong>Cursor AI Prompt</strong> in a blue box</li>
                <li>Click <strong>&quot;Copy&quot;</strong> to copy the prompt</li>
                <li>Open Cursor AI chat (<kbd className="px-2 py-1 bg-muted rounded">Cmd+L</kbd> or <kbd className="px-2 py-1 bg-muted rounded">Ctrl+L</kbd>)</li>
                <li>Paste the prompt and press <kbd className="px-2 py-1 bg-muted rounded">Enter</kbd></li>
                <li>Cursor AI does the work - approve commands when asked</li>
                <li>Move to the next step!</li>
              </ol>
            </div>

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

          <div className="my-4 p-4 bg-muted border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Important:</strong> Replace <code>&quot;YourName&quot;</code> and <code>&quot;your.email@example.com&quot;</code> with your actual name and email before copying!
            </p>
          </div>

          <div className="mt-6 space-y-2 text-muted-foreground">
            <p><strong>What Cursor will do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Detect your operating system (Mac/Windows/Linux)</li>
              <li>Install Git using the appropriate method</li>
              <li>Configure your Git credentials</li>
              <li>Verify the installation</li>
              <li>Handle any errors automatically</li>
            </ul>
          </div>

        </StepSection>

        {/* Step 2: Setup GitHub */}
        <StepSection id="github" title="Setup GitHub Account & SSH" emoji="🐙" estimatedTime="7 min">
          <p className="mb-4">
            GitHub is where we&apos;ll store your code and collaborate. Let&apos;s create an account and set up secure SSH authentication.
          </p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-2">Manual Step First:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Visit <a href="https://github.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">https://github.com/signup</a></li>
              <li>Create account with your email</li>
              <li>Verify your email</li>
              <li>Keep GitHub open for next step</li>
            </ol>
          </div>

          <CursorPrompt 
            prompt='Generate an SSH key for my GitHub account using my email &quot;your.email@example.com&quot;, add it to the SSH agent, copy the public key to my clipboard, and give me instructions on how to add it to GitHub. Then test the SSH connection to GitHub.'
          />

          <div className="mt-6 space-y-2 text-muted-foreground">
            <p><strong>After Cursor generates the key:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Your SSH public key will be copied to clipboard</li>
              <li>Go to <a href="https://github.com/settings/keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">https://github.com/settings/keys</a></li>
              <li>Click &quot;New SSH key&quot;</li>
              <li>Paste the key and click &quot;Add SSH key&quot;</li>
              <li>Tell Cursor &quot;done&quot; to test the connection</li>
            </ol>
          </div>

        </StepSection>

        {/* Step 3: Install Node.js */}
        <StepSection id="node" title="Install Node.js & npm" emoji="⚡" estimatedTime="3 min">
          <p className="mb-4">
            Node.js is the JavaScript runtime that powers this application. npm is the package manager that installs all the dependencies.
          </p>

          <CursorPrompt 
            prompt='Install the latest LTS version of Node.js and npm on my system. Then verify both are installed correctly and show me the versions.'
          />

          <div className="mt-6 space-y-2 text-muted-foreground">
            <p><strong>What Cursor will do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Detect your OS</li>
              <li>Install Node.js LTS version</li>
              <li>Install npm automatically</li>
              <li>Verify installations</li>
              <li>Display versions (should be Node 18+ and npm 9+)</li>
            </ul>
          </div>

        </StepSection>

        {/* Step 4: Fork Repository */}
        <StepSection id="fork" title="Fork the Repository" emoji="🍴" estimatedTime="2 min">
          <p className="mb-4">
            Forking creates your own copy of the codebase that you can customize and deploy.
          </p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-2">Manual Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Visit <a href="https://github.com/YOUR-ORG/vercel-supabase-web3" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">the repository</a></li>
              <li>Click the <strong>&quot;Fork&quot;</strong> button (top right)</li>
              <li>Wait for fork to complete</li>
              <li>Copy your fork&apos;s URL: <code className="bg-muted px-2 py-1 rounded">https://github.com/YOUR-USERNAME/vercel-supabase-web3</code></li>
            </ol>
          </div>

          <div className="my-4 p-4 border border-border bg-card rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Keep this URL handy</strong> - you&apos;ll need it in the next step!
            </p>
          </div>

        </StepSection>

        {/* Step 5: Clone Repository */}
        <StepSection id="clone" title="Clone & Setup Repository" emoji="📥" estimatedTime="5 min">
          <p className="mb-4">
            Now let&apos;s download the code to your computer and install all the dependencies.
          </p>

          <CursorPrompt 
            prompt='Clone the GitHub repository from https://github.com/YOUR-USERNAME/vercel-supabase-web3.git into my Documents folder. Then navigate into the project directory, install all npm dependencies, and open the project in Cursor.'
          />

          <div className="my-4 p-4 bg-muted border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Remember:</strong> Replace <code>YOUR-USERNAME</code> with your actual GitHub username!
            </p>
          </div>

          <div className="mt-6 space-y-2 text-muted-foreground">
            <p><strong>What Cursor will do:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Clone your forked repository</li>
              <li>Navigate into the project directory</li>
              <li>Run <code>npm install</code> (may take 2-3 minutes)</li>
              <li>Open the project in Cursor IDE</li>
            </ul>
          </div>

        </StepSection>

        {/* Step 6: Deploy to Vercel */}
        <StepSection id="vercel" title="Setup Vercel & Deploy" emoji="▲" estimatedTime="10 min">
          <p className="mb-4">
            Vercel will host your app and make it accessible on the internet. Let&apos;s deploy!
          </p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-2">Manual Step First:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Visit <a href="https://vercel.com/signup" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">https://vercel.com/signup</a></li>
              <li>Sign up with GitHub</li>
              <li>Authorize Vercel to access your repositories</li>
            </ol>
          </div>

          <CursorPrompt 
            prompt='Install the Vercel CLI globally, authenticate with my Vercel account, then deploy this project to Vercel production. Accept all default settings and show me the deployment URL when finished.'
          />

          <div className="mt-6 space-y-2 text-muted-foreground">
            <p><strong>What will happen:</strong></p>
            <ol className="list-decimal list-inside space-y-1 ml-4">
              <li>Cursor installs Vercel CLI</li>
              <li>Opens browser for you to authorize</li>
              <li>Deploys your app (takes 2-3 minutes)</li>
              <li>Shows your live URL (like <code>https://your-app.vercel.app</code>)</li>
            </ol>
          </div>

          <div className="my-4 p-4 border border-border bg-card rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Save your deployment URL!</strong> You&apos;ll need it later.
            </p>
          </div>

        </StepSection>

        {/* Step 7: Custom Domain Setup (Optional) */}
        <StepSection id="domain" title="Setup Custom Domain (Optional)" emoji="🌐" estimatedTime="20 min">
          <p className="mb-4">
            Give your application a professional custom domain instead of the default <code>.vercel.app</code> URL. This step works for any Vercel project and any domain provider.
          </p>

          <div className="my-6 p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
            <p className="font-semibold text-foreground mb-2">⏭️ Optional Step</p>
            <p className="text-sm text-muted-foreground">
              You can skip this step and use your <code>.vercel.app</code> domain for now. Come back to add a custom domain later when you&apos;re ready to launch publicly.
            </p>
          </div>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-3">📋 Prerequisites</p>
            <div className="space-y-2 text-sm">
              <div className="p-2 bg-muted rounded">
                <p className="font-semibold text-foreground">Option A: I already own a domain</p>
                <p className="text-xs text-muted-foreground mt-1">→ Skip to Step 2 (Connect to Vercel)</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="font-semibold text-foreground">Option B: I need to buy a domain</p>
                <p className="text-xs text-muted-foreground mt-1">→ Start with Step 1 (Purchase Domain)</p>
              </div>
            </div>
          </div>

          <div className="my-6 p-4 border border-blue-500/30 bg-blue-500/5 rounded-lg">
            <p className="font-semibold text-foreground mb-3">🛒 Step 1: Purchase Domain (Namecheap Example)</p>
            <p className="text-sm text-muted-foreground mb-3">
              This guide uses Namecheap, but the process is similar for GoDaddy, Google Domains, Cloudflare, or any provider.
            </p>
            
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
              <li><strong>Search for Domain</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Go to <a href="https://www.namecheap.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">namecheap.com</a></li>
                  <li>Enter your desired domain name (e.g., &quot;myawesomeapp&quot;)</li>
                  <li>Check availability (try different extensions: .com, .io, .app, etc.)</li>
                  <li>Typical cost: $10-15/year for .com domains</li>
                </ul>
              </li>

              <li><strong>Add to Cart & Checkout</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Click &quot;Add to Cart&quot; on your chosen domain</li>
                  <li>Review cart (you don&apos;t need extras like hosting, privacy protection is optional)</li>
                  <li>Click &quot;Confirm Order&quot;</li>
                  <li>Create Namecheap account if you don&apos;t have one</li>
                  <li>Enter payment details and complete purchase</li>
                </ul>
              </li>

              <li><strong>Access Domain Management</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>After purchase, go to <a href="https://ap.www.namecheap.com/domains/list/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Namecheap Domain List</a></li>
                  <li>Find your new domain in the list</li>
                  <li>Click <strong>&quot;Manage&quot;</strong> button next to it</li>
                  <li>You&apos;ll be on the Domain Details page - keep this tab open</li>
                </ul>
              </li>
            </ol>
          </div>

          <div className="my-6 p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
            <p className="font-semibold text-foreground mb-3">🔗 Step 2: Connect Domain to Vercel</p>
            
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm">
              <li><strong>Add Domain in Vercel Dashboard</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Open new tab → <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">vercel.com/dashboard</a></li>
                  <li>Click on your project</li>
                  <li>Go to <strong>Settings</strong> tab (top navigation)</li>
                  <li>Click <strong>Domains</strong> in left sidebar</li>
                  <li>You&apos;ll see &quot;Add Domain&quot; section at top</li>
                </ul>
              </li>

              <li><strong>Enter Your Domain</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>In the input field, type your domain exactly as purchased</li>
                  <li>Examples:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Root domain: <code className="bg-muted px-1 py-0.5 rounded">myawesomeapp.com</code></li>
                      <li>With www: <code className="bg-muted px-1 py-0.5 rounded">www.myawesomeapp.com</code></li>
                      <li>Subdomain: <code className="bg-muted px-1 py-0.5 rounded">app.myawesomeapp.com</code></li>
                    </ul>
                  </li>
                  <li>Click <strong>&quot;Add&quot;</strong> button</li>
                </ul>
              </li>

              <li><strong>Note the DNS Records</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Vercel will show &quot;Invalid Configuration&quot; - this is normal!</li>
                  <li>You&apos;ll see instructions for DNS records to add</li>
                  <li><strong>IMPORTANT:</strong> Keep this page open - you&apos;ll need these values!</li>
                  <li>Typical records shown:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li><strong>A Record:</strong> Type=A, Name=@, Value=76.76.21.21</li>
                      <li><strong>CNAME Record:</strong> Type=CNAME, Name=www, Value=cname.vercel-dns.com</li>
                    </ul>
                  </li>
                </ul>
              </li>
            </ol>

            <div className="mt-3 p-3 bg-background border border-border rounded text-xs">
              <strong className="text-foreground">💡 Tip:</strong> <span className="text-muted-foreground">Add both root domain (<code>myawesomeapp.com</code>) and www subdomain (<code>www.myawesomeapp.com</code>) separately. Vercel will automatically redirect one to the other.</span>
            </div>
          </div>

          <div className="my-6 p-4 border border-primary/30 bg-primary/5 rounded-lg">
            <p className="font-semibold text-foreground mb-3">⚙️ Step 3: Configure DNS Records (Namecheap)</p>
            <p className="text-sm text-muted-foreground mb-3">
              Now we&apos;ll add the DNS records from Vercel to your domain provider. These instructions are for Namecheap, but the concept is the same for all providers.
            </p>
            
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm">
              <li><strong>Navigate to Advanced DNS</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>In your Namecheap domain management page (kept open from Step 1)</li>
                  <li>Click <strong>&quot;Advanced DNS&quot;</strong> tab at the top</li>
                  <li>You&apos;ll see &quot;HOST RECORDS&quot; section</li>
                  <li>This is where we add DNS records</li>
                </ul>
              </li>

              <li><strong>Remove Conflicting Records (if any)</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Look for existing A or CNAME records with Host &quot;@&quot; or &quot;www&quot;</li>
                  <li>Common defaults: Namecheap Parking Page, URL Redirect records</li>
                  <li>Click the trash icon (🗑️) next to each to delete</li>
                  <li>If unsure, you can keep them and add new ones (newer records take precedence)</li>
                </ul>
              </li>

              <li><strong>Add A Record (for root domain)</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Click <strong>&quot;Add New Record&quot;</strong> button</li>
                  <li>Fill in the form:
                    <div className="mt-2 ml-6 p-2 bg-background border border-border rounded">
                      <div className="space-y-1">
                        <div><strong>Type:</strong> <code className="bg-muted px-1 py-0.5 rounded ml-1">A Record</code></div>
                        <div><strong>Host:</strong> <code className="bg-muted px-1 py-0.5 rounded ml-1">@</code> <span className="text-muted-foreground text-xs ml-2">(@ means root domain)</span></div>
                        <div><strong>Value:</strong> <code className="bg-muted px-1 py-0.5 rounded ml-1">76.76.21.21</code> <span className="text-muted-foreground text-xs ml-2">(Vercel&apos;s IP)</span></div>
                        <div><strong>TTL:</strong> <code className="bg-muted px-1 py-0.5 rounded ml-1">Automatic</code> <span className="text-muted-foreground text-xs ml-2">(or 1 min/5 min/30 min)</span></div>
                      </div>
                    </div>
                  </li>
                  <li>Click <strong>&quot;Save Changes&quot;</strong> or checkmark icon (✓)</li>
                </ul>
              </li>

              <li><strong>Add CNAME Record (for www subdomain)</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Click <strong>&quot;Add New Record&quot;</strong> button again</li>
                  <li>Fill in the form:
                    <div className="mt-2 ml-6 p-2 bg-background border border-border rounded">
                      <div className="space-y-1">
                        <div><strong>Type:</strong> <code className="bg-muted px-1 py-0.5 rounded ml-1">CNAME Record</code></div>
                        <div><strong>Host:</strong> <code className="bg-muted px-1 py-0.5 rounded ml-1">www</code></div>
                        <div><strong>Value/Target:</strong> <code className="bg-muted px-1 py-0.5 rounded ml-1">cname.vercel-dns.com</code> <span className="text-muted-foreground text-xs ml-2">(or your Vercel URL)</span></div>
                        <div><strong>TTL:</strong> <code className="bg-muted px-1 py-0.5 rounded ml-1">Automatic</code></div>
                      </div>
                    </div>
                  </li>
                  <li>Click <strong>&quot;Save Changes&quot;</strong> or checkmark icon (✓)</li>
                </ul>
              </li>

              <li><strong>Save All Changes</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Some providers have a &quot;Save All Changes&quot; button at the bottom - click it</li>
                  <li>Namecheap auto-saves when you click checkmark on each record</li>
                  <li>Verify both records appear in the &quot;HOST RECORDS&quot; list</li>
                </ul>
              </li>
            </ol>

            <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded text-xs">
              <strong className="text-red-600 dark:text-red-400">⚠️ Common DNS Mistakes:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                <li><strong>Wrong IP:</strong> Must be <code>76.76.21.21</code> exactly (not 76.76.21.98 or others)</li>
                <li><strong>Wrong CNAME:</strong> Use <code>cname.vercel-dns.com</code> (not your-project.vercel.app)</li>
                <li><strong>Trailing dot:</strong> Don&apos;t add a dot at end of CNAME value</li>
                <li><strong>Host field:</strong> Use <code>@</code> for root, <code>www</code> for www (not blank or &quot;root&quot;)</li>
              </ul>
            </div>
          </div>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-3">🕐 Step 4: Wait for DNS Propagation</p>
            
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
              <li><strong>Go Back to Vercel Dashboard</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Return to Vercel → Settings → Domains page</li>
                  <li>Vercel automatically checks DNS every few seconds</li>
                  <li>You&apos;ll see one of these statuses next to your domain</li>
                </ul>
              </li>

              <li><strong>Understand Status Indicators</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li><strong className="text-yellow-600 dark:text-yellow-400">🟡 Pending/Invalid Configuration:</strong> DNS not propagated yet
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Normal for first 5-30 minutes</li>
                      <li>Vercel is waiting to detect your DNS changes</li>
                      <li>Be patient - don&apos;t add duplicate records!</li>
                    </ul>
                  </li>
                  <li><strong className="text-green-600 dark:text-green-400">🟢 Valid:</strong> Domain is connected! ✅
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>DNS successfully propagated</li>
                      <li>SSL certificate auto-provisioned</li>
                      <li>Domain is live and working</li>
                    </ul>
                  </li>
                  <li><strong className="text-red-600 dark:text-red-400">🔴 Error:</strong> Configuration problem
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>Check DNS records for typos</li>
                      <li>Verify A record = 76.76.21.21</li>
                      <li>Verify CNAME = cname.vercel-dns.com</li>
                    </ul>
                  </li>
                </ul>
              </li>

              <li><strong>Propagation Time Expectations</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li><strong>Best case:</strong> 5-10 minutes (most common with Namecheap, Cloudflare)</li>
                  <li><strong>Average:</strong> 15-30 minutes</li>
                  <li><strong>Worst case:</strong> Up to 48 hours (rare, usually with some providers)</li>
                  <li>Refresh Vercel page every 5 minutes to check status</li>
                </ul>
              </li>

              <li><strong>Test Your Domain</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Once status shows &quot;Valid&quot;, open new tab</li>
                  <li>Visit <code>https://yourdomain.com</code> (your actual domain)</li>
                  <li>Should load your app with HTTPS (🔒 padlock in browser)</li>
                  <li>Try <code>https://www.yourdomain.com</code> too - should redirect</li>
                </ul>
              </li>
            </ol>

            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded text-xs">
              <strong className="text-green-600 dark:text-green-400">✅ Success Indicators:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1 text-muted-foreground">
                <li>Vercel shows &quot;Valid&quot; status with green checkmark</li>
                <li>Domain loads your app (not parking page or errors)</li>
                <li>HTTPS works automatically (see padlock in browser)</li>
                <li>SSL certificate shows as valid (click padlock to verify)</li>
              </ul>
            </div>
          </div>

          <div className="my-6 p-4 border border-purple-500/30 bg-purple-500/5 rounded-lg">
            <p className="font-semibold text-foreground mb-3">🔧 Troubleshooting Common Issues</p>
            
            <div className="space-y-3 text-sm">
              <div className="p-3 bg-background border border-border rounded">
                <p className="font-semibold text-foreground mb-1">❌ &quot;Invalid Configuration&quot; After 1+ Hours</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside ml-4 space-y-1">
                  <li>Double-check A record: Host=@, Value=76.76.21.21</li>
                  <li>Double-check CNAME: Host=www, Value=cname.vercel-dns.com</li>
                  <li>Remove any duplicate or conflicting records</li>
                  <li>Some providers need 24-48 hours - check provider documentation</li>
                  <li>Try using <a href="https://dnschecker.org" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">dnschecker.org</a> to verify DNS propagation globally</li>
                </ul>
              </div>

              <div className="p-3 bg-background border border-border rounded">
                <p className="font-semibold text-foreground mb-1">❌ Domain Shows Parking Page or Old Content</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside ml-4 space-y-1">
                  <li>Delete Namecheap parking page redirect (in Advanced DNS)</li>
                  <li>Clear browser cache (Cmd+Shift+R or Ctrl+Shift+R)</li>
                  <li>Try incognito/private browsing mode</li>
                  <li>Wait 5-10 more minutes for DNS to update</li>
                </ul>
              </div>

              <div className="p-3 bg-background border border-border rounded">
                <p className="font-semibold text-foreground mb-1">❌ SSL Certificate Error</p>
                <ul className="text-xs text-muted-foreground list-disc list-inside ml-4 space-y-1">
                  <li>Vercel auto-provisions SSL when DNS is valid</li>
                  <li>Can take 5-15 minutes after domain connects</li>
                  <li>Visit domain via HTTPS (not HTTP)</li>
                  <li>If persists, go to Vercel Settings → Domains → Click domain → Refresh SSL</li>
                </ul>
              </div>

              <div className="p-3 bg-background border border-border rounded">
                <p className="font-semibold text-foreground mb-1">💬 Still Stuck? Use Cursor AI</p>
                <CursorPrompt 
                  prompt='My custom domain is showing &quot;Invalid Configuration&quot; in Vercel after adding DNS records. Help me troubleshoot:

1. Verify my DNS records are correct for Namecheap
2. Check common configuration issues
3. Use dig or nslookup to test DNS propagation
4. Provide next steps to resolve this

My domain: [YOUR_DOMAIN]
Provider: Namecheap
Records added: A record (@, 76.76.21.21) and CNAME (www, cname.vercel-dns.com)'
                  title="Cursor Prompt: Domain Troubleshooting"
                />
              </div>
            </div>
          </div>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-3">🌍 Other Domain Providers (Quick Reference)</p>
            <p className="text-sm text-muted-foreground mb-3">
              The DNS configuration process is similar for all providers. Here&apos;s where to find DNS settings:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div className="p-2 bg-muted rounded">
                <p className="font-semibold text-foreground">GoDaddy</p>
                <p className="text-muted-foreground">My Products → Domain → DNS → Manage DNS → Records</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="font-semibold text-foreground">Google Domains</p>
                <p className="text-muted-foreground">My Domains → [Domain] → DNS → Custom records</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="font-semibold text-foreground">Cloudflare</p>
                <p className="text-muted-foreground">Dashboard → [Domain] → DNS → Records</p>
              </div>
              <div className="p-2 bg-muted rounded">
                <p className="font-semibold text-foreground">Hover</p>
                <p className="text-muted-foreground">Domain → DNS → Add New</p>
              </div>
            </div>

            <div className="mt-3 text-xs text-muted-foreground">
              <strong>Universal Steps:</strong> Find DNS settings → Add A record (@ → 76.76.21.21) → Add CNAME (www → cname.vercel-dns.com) → Save → Wait 5-30 min → Verify in Vercel
            </div>
          </div>

          <div className="my-6 p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
            <p className="font-semibold text-foreground mb-2">✅ Success! What&apos;s Next?</p>
            <p className="text-sm text-muted-foreground mb-3">
              Once your domain is connected and shows &quot;Valid&quot; in Vercel:
            </p>
            <ul className="text-xs text-muted-foreground list-disc list-inside ml-4 space-y-1">
              <li>Update your Supabase Site URL to use the custom domain (in Step 11: Configure Email)</li>
              <li>Update any API callbacks or webhooks to use the new domain</li>
              <li>Share your professional domain with users! 🎉</li>
              <li>Consider adding email forwarding in your domain provider (e.g., hello@yourdomain.com)</li>
            </ul>
          </div>

        </StepSection>

        {/* Step 8: Setup Supabase */}
        <StepSection id="supabase" title="Setup Supabase Account" emoji="🗄️" estimatedTime="5 min">
          <p className="mb-4">
            Supabase provides your database, authentication, and file storage - all in one platform.
          </p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-2">Manual Steps:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Visit <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">https://supabase.com</a></li>
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

        </StepSection>

        {/* Step 8: Environment Variables */}
        <StepSection id="env" title="Configure Environment Variables" emoji="🔐" estimatedTime="10 min">
          <p className="mb-4">
            Let&apos;s connect your application frontend to your backend services using environment variables. This step works for any project using Vercel and any backend service (Supabase, Firebase, custom APIs, etc.).
          </p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-2">📋 Step 1: Gather Your Credentials</p>
            <p className="text-sm text-muted-foreground mb-3">
              For this starter project, you need Supabase credentials. For your own project, gather API keys from your backend service.
            </p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-sm">
              <li>Open <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Supabase Dashboard</a></li>
              <li>Select your project (<code>devdapp-web3</code> or your project name)</li>
              <li>Click <strong>⚙️ Settings</strong> in the left sidebar</li>
              <li>Click <strong>API</strong> in the Settings submenu</li>
              <li>You&apos;ll see two important values:
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1">
                  <li><strong>Project URL</strong> - Copy this (starts with <code>https://xxxxx.supabase.co</code>)</li>
                  <li><strong>anon public key</strong> - Copy this (long string starting with <code>eyJ...</code>)</li>
                </ul>
              </li>
              <li>Keep these values in a safe place (you&apos;ll need them in the next step)</li>
            </ol>
          </div>

          <div className="my-6 p-4 border border-primary/30 bg-primary/5 rounded-lg">
            <p className="font-semibold text-foreground mb-2">🎯 Choose Your Approach</p>
            <p className="text-sm text-muted-foreground mb-3">
              There are two ways to set environment variables in Vercel. Choose one:
            </p>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-background border border-border rounded">
                <p className="font-semibold text-foreground">Option A: CLI (Recommended - Faster)</p>
                <p className="text-muted-foreground text-xs mt-1">Use Cursor AI to create local file and upload via CLI</p>
              </div>
              <div className="p-3 bg-background border border-border rounded">
                <p className="font-semibold text-foreground">Option B: Vercel Dashboard (Manual)</p>
                <p className="text-muted-foreground text-xs mt-1">Add variables one-by-one through Vercel&apos;s web interface</p>
              </div>
            </div>
          </div>

          <div className="my-6 p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
            <p className="font-semibold text-foreground mb-3">✅ Option A: Using CLI (Recommended)</p>
            
            <CursorPrompt 
              prompt='Help me set up environment variables for my backend service. First, create a .env.local file in my project root with these variables:

NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY="YOUR_ANON_KEY"

Then, guide me through uploading this .env.local file to Vercel using the Vercel CLI with these steps:
1. Install/verify Vercel CLI is ready
2. Navigate to my project directory
3. Use vercel env pull to sync existing env vars (if any)
4. Use vercel env add to add each variable from .env.local to all environments (production, preview, development)
5. Confirm variables were added successfully
6. Trigger a new production deployment to apply the changes

Walk me through each command with explanations.'
              title="Cursor Prompt: CLI Method"
            />

            <div className="mt-3 p-3 bg-background border border-border rounded text-xs text-muted-foreground">
              <strong>⚠️ Important:</strong> Replace <code>YOUR_SUPABASE_URL</code> and <code>YOUR_ANON_KEY</code> with the actual values you copied from Supabase in Step 1!
            </div>
          </div>

          <div className="my-6 p-4 border border-blue-500/30 bg-blue-500/5 rounded-lg">
            <p className="font-semibold text-foreground mb-3">🖱️ Option B: Using Vercel Dashboard (Manual)</p>
            <p className="text-sm text-muted-foreground mb-3">
              Follow these detailed steps to add environment variables through Vercel&apos;s web interface:
            </p>
            
            <ol className="list-decimal list-inside space-y-3 text-muted-foreground text-sm">
              <li><strong>Navigate to Project Settings</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Go to <a href="https://vercel.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">vercel.com/dashboard</a></li>
                  <li>Find your project in the list</li>
                  <li>Click on your project name to open it</li>
                  <li>Click <strong>&quot;Settings&quot;</strong> tab in the top navigation</li>
                  <li>In the left sidebar, click <strong>&quot;Environment Variables&quot;</strong></li>
                </ul>
              </li>

              <li><strong>Add First Variable (Project URL)</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>You&apos;ll see a form with three fields: &quot;Name&quot;, &quot;Value&quot;, and environment checkboxes</li>
                  <li>In <strong>Name</strong> field, type: <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code></li>
                  <li>In <strong>Value</strong> field, paste your Supabase Project URL (from Step 1)</li>
                  <li>Under <strong>&quot;Environments&quot;</strong>, check all three boxes:
                    <ul className="list-disc list-inside ml-6 mt-1">
                      <li>☑️ Production</li>
                      <li>☑️ Preview</li>
                      <li>☑️ Development</li>
                    </ul>
                  </li>
                  <li>Click <strong>&quot;Save&quot;</strong> button</li>
                  <li>Wait for confirmation message (green checkmark)</li>
                </ul>
              </li>

              <li><strong>Add Second Variable (Anon Key)</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>The form resets after saving the first variable</li>
                  <li>In <strong>Name</strong> field, type: <code className="bg-muted px-1 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY</code></li>
                  <li>In <strong>Value</strong> field, paste your Supabase anon public key (from Step 1)</li>
                  <li>Check all three environment boxes again (Production, Preview, Development)</li>
                  <li>Click <strong>&quot;Save&quot;</strong></li>
                  <li>Wait for confirmation</li>
                </ul>
              </li>

              <li><strong>Verify Variables Were Added</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Scroll down on the Environment Variables page</li>
                  <li>You should see both variables listed in a table</li>
                  <li>Each should show &quot;Production, Preview, Development&quot; in the Environments column</li>
                  <li>Values are hidden (shown as <code>•••••</code>) for security</li>
                  <li>If you need to edit, click the &quot;•••&quot; menu → Edit</li>
                </ul>
              </li>

              <li><strong>Redeploy to Apply Changes</strong>
                <ul className="list-disc list-inside ml-6 mt-1 space-y-1 text-xs">
                  <li>Environment variables only apply to NEW deployments</li>
                  <li>Go back to <strong>&quot;Deployments&quot;</strong> tab (top navigation)</li>
                  <li>Find the latest Production deployment (has 🌐 icon)</li>
                  <li>Click the &quot;•••&quot; menu next to it</li>
                  <li>Select <strong>&quot;Redeploy&quot;</strong></li>
                  <li>In the modal, keep &quot;Use existing Build Cache&quot; unchecked</li>
                  <li>Click <strong>&quot;Redeploy&quot;</strong> button</li>
                  <li>Wait 2-3 minutes for deployment to complete</li>
                  <li>Look for &quot;Ready&quot; status with green checkmark</li>
                </ul>
              </li>
            </ol>

            <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded text-xs text-muted-foreground">
              <strong className="text-yellow-600 dark:text-yellow-400">⚠️ Common Mistakes:</strong>
              <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                <li>Forgetting to check all three environment boxes (variables won&apos;t work in all contexts)</li>
                <li>Typos in variable names (must match exactly, case-sensitive)</li>
                <li>Not redeploying after adding variables (old deployment still active)</li>
                <li>Adding spaces before/after values (copy-paste carefully)</li>
              </ul>
            </div>
          </div>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-2">🔍 Verify Setup</p>
            <p className="text-sm text-muted-foreground mb-2">
              After deployment completes, verify your environment variables are working:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground text-xs ml-4">
              <li>Visit your production URL (from Step 6)</li>
              <li>Open browser DevTools (F12 or Cmd+Option+I)</li>
              <li>Go to Console tab</li>
              <li>Type: <code className="bg-muted px-1 py-0.5 rounded">console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)</code></li>
              <li>Press Enter - you should see your Supabase URL (not <code>undefined</code>)</li>
              <li>If you see <code>undefined</code>, double-check variable names and redeploy</li>
            </ol>
          </div>

          <div className="my-6 p-4 border border-primary/30 bg-primary/5 rounded-lg">
            <p className="font-semibold text-foreground mb-2">💡 Generic Project Tip</p>
            <p className="text-sm text-muted-foreground">
              For <strong>any project</strong>, the process is the same - just use different variable names and values. Common examples:
            </p>
            <ul className="text-xs text-muted-foreground list-disc list-inside ml-4 mt-2 space-y-1">
              <li><code>NEXT_PUBLIC_API_URL</code> - Your backend API endpoint</li>
              <li><code>NEXT_PUBLIC_FIREBASE_CONFIG</code> - Firebase configuration</li>
              <li><code>DATABASE_URL</code> - Database connection string (not public, no NEXT_PUBLIC prefix)</li>
              <li><code>API_SECRET_KEY</code> - Secret keys (never use NEXT_PUBLIC prefix for secrets!)</li>
            </ul>
            <div className="mt-2 p-2 bg-red-500/10 border border-red-500/30 rounded text-xs">
              <strong className="text-red-600 dark:text-red-400">🔒 Security Note:</strong> Only use <code>NEXT_PUBLIC_</code> prefix for values that are safe to expose in the browser. Secret keys, API tokens, database passwords should NEVER have this prefix!
            </div>
          </div>

        </StepSection>

        {/* Step 9: Setup Database */}
        <StepSection id="database" title="Setup Database with SQL" emoji="🗃️" estimatedTime="10 min">
          <p className="mb-4">
            Now let&apos;s create the database schema for user authentication, profiles, and file storage.
          </p>

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-3">Step-by-Step Instructions:</p>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Open your Supabase dashboard at <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">https://supabase.com/dashboard</a></li>
              <li>Select your project (<code>devdapp-web3</code>)</li>
              <li>Click <strong>&quot;SQL Editor&quot;</strong> in the left sidebar</li>
              <li>Click <strong>&quot;New query&quot;</strong> button</li>
              <li>Click the <strong>&quot;Copy SQL&quot;</strong> button below</li>
              <li>Paste the SQL into the editor (Cmd/Ctrl + V)</li>
              <li>Click <strong>&quot;Run&quot;</strong> (or press Cmd/Ctrl + Enter)</li>
              <li>Wait 10-15 seconds for completion</li>
              <li>Look for <strong>&quot;🎉 SETUP COMPLETE!&quot;</strong> in the results</li>
            </ol>
          </div>

          <CursorPrompt 
            prompt='Read the SQL setup script from docs/profile/SETUP-SCRIPT.sql in my project root, copy it to my clipboard, and confirm it was copied successfully.'
            title="Get SQL Script via Cursor"
          />

          <div className="my-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <p className="text-sm text-foreground mb-2">
              <strong>💡 What This SQL Does:</strong>
            </p>
            <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
              <li>Creates <code>profiles</code> table with all user fields</li>
              <li>Sets up profile image storage bucket</li>
              <li>Configures Row Level Security (RLS) policies</li>
              <li>Adds automatic profile creation triggers</li>
              <li>Creates performance indexes</li>
              <li>Adds data validation constraints</li>
            </ul>
          </div>

          <div className="my-6 p-4 border border-green-500/30 bg-green-500/5 rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong className="text-green-600 dark:text-green-400">✅ Success Indicators:</strong> You should see green checkmarks (✅) and the message <strong>&quot;🎉 PROFILE SYSTEM SETUP COMPLETE!&quot;</strong> at the end of the results. If you see any red errors (❌), copy the error message and ask Cursor to help troubleshoot.
            </p>
          </div>

        </StepSection>

        {/* Step 10: Configure Email */}
        <StepSection id="email" title="Configure Email Authentication" emoji="📧" estimatedTime="5 min">
          <p className="mb-4">
            Enable email signup and confirmation so users can create accounts.
          </p>

          <CursorPrompt 
            prompt='Give me step-by-step instructions to configure email authentication in Supabase. I need to set the Site URL to my Vercel deployment URL &quot;YOUR_VERCEL_URL&quot;, add the necessary redirect URLs for auth callback and confirmation, and update the email confirmation template. Show me exactly what settings to change and what template HTML to use.'
          />

          <div className="my-4 p-4 bg-muted border border-border rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Replace</strong> <code>YOUR_VERCEL_URL</code> with your actual Vercel deployment URL from Step 6!
            </p>
          </div>

          <div className="mt-6 space-y-2 text-muted-foreground">
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

        </StepSection>

        {/* Step 11: Test Everything */}
        <StepSection id="test" title="Test Everything" emoji="✅" estimatedTime="5 min">
          <p className="mb-4">
            Let&apos;s verify your complete setup works end-to-end!
          </p>

          <CursorPrompt 
            prompt='Open my deployed Vercel app in a browser and guide me through testing the complete authentication flow. Include signing up with a test email, checking for confirmation email, verifying the profile works, and testing the blockchain pages.'
          />

          <div className="my-6 p-4 border border-border bg-card rounded-lg">
            <p className="font-semibold text-foreground mb-2">Testing Checklist:</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>✅ Visit live site opens correctly</li>
              <li>✅ Navigate to <code>/auth/sign-up</code></li>
              <li>✅ Sign up with test email (use <a href="https://mailinator.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">mailinator.com</a>)</li>
              <li>✅ Receive confirmation email</li>
              <li>✅ Click confirmation link redirects to profile</li>
              <li>✅ Profile page loads and is editable</li>
              <li>✅ Blockchain pages work (<code>/avalanche</code>, <code>/flow</code>, etc.)</li>
              <li>✅ Dark/light mode toggle works</li>
              <li>✅ Mobile responsive design works</li>
            </ul>
          </div>

          <div className="my-6 p-4 bg-muted border border-border rounded-lg">
            <p className="font-semibold text-foreground mb-2">If Something Doesn&apos;t Work:</p>
            <p className="text-sm text-muted-foreground">
              Ask Cursor: <code>&quot;The [specific feature] isn&apos;t working. Help me troubleshoot by checking the relevant configuration and logs.&quot;</code>
            </p>
          </div>

        </StepSection>

        {/* Step 12: What's Next */}
        <StepSection id="next" title="What's Next?" emoji="🚀" estimatedTime="Ongoing">
          <p className="mb-6 text-lg">
            You now have a production-ready multi-chain Web3 dApp! Here&apos;s how to continue your journey:
          </p>

          <div className="space-y-6">
            {/* Customize Branding */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">1. Customize Your Branding</h3>
              <CursorPrompt 
                prompt='Help me customize the branding of my Web3 app. Show me how to update the site title, description, colors, and logo. Point me to the specific files I need to edit.'
                title="Cursor Prompt: Customize Branding"
              />
            </div>

            {/* Add Features */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">2. Add Custom Features</h3>
              <CursorPrompt 
                prompt='I want to add [describe your feature] to my app. Help me implement this feature using the existing codebase structure and best practices.'
                title="Cursor Prompt: Add Features"
              />
            </div>

            {/* Custom Domain */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">3. Deploy a Custom Domain</h3>
              <CursorPrompt 
                prompt='Help me connect a custom domain to my Vercel deployment. Guide me through purchasing a domain (if needed) and configuring DNS settings.'
                title="Cursor Prompt: Custom Domain"
              />
            </div>

            {/* Learn Codebase */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">4. Understand the Codebase</h3>
              <CursorPrompt 
                prompt='Give me a tour of this codebase. Explain the folder structure, key files, and how the different parts work together.'
                title="Cursor Prompt: Codebase Tour"
              />
            </div>

            {/* Web3 Integration */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">5. Add Web3 Wallet Integration</h3>
              <CursorPrompt 
                prompt='Help me integrate Web3 wallet connection (MetaMask, WalletConnect) into my app. Show me where to add the code and how to test it.'
                title="Cursor Prompt: Wallet Integration"
              />
            </div>

            {/* Resources */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">Resources to Explore</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li><a href="https://nextjs.org/docs" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Next.js Documentation</a></li>
                <li><a href="https://supabase.com/docs" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Supabase Documentation</a></li>
                <li><a href="https://tailwindcss.com/docs" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Tailwind CSS Documentation</a></li>
                <li><a href="https://web3js.readthedocs.io/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Web3.js Documentation</a></li>
                <li><a href="https://docs.ethers.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground">Ethers.js Documentation</a></li>
              </ul>
            </div>

            {/* Community */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="text-xl font-bold text-foreground mb-3">Join the Community</h3>
              <ul className="space-y-2 text-muted-foreground">
                <li>⭐ Star the repo on GitHub</li>
                <li>Report issues or suggest features</li>
                <li>Contribute improvements</li>
                <li>Help other developers in discussions</li>
              </ul>
            </div>
          </div>


          <div className="mt-8 text-center">
            <div className="inline-block rounded-2xl bg-gradient-to-r from-primary to-primary/60 p-1">
              <div className="rounded-xl bg-background px-8 py-6">
                <p className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-2">
                  Achievement Unlocked
                </p>
                <p className="text-5xl font-black text-foreground">
                  100% COMPLETE
                </p>
              </div>
            </div>
          </div>
        </StepSection>
      </main>
    </div>
  )
}