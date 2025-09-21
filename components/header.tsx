import { Button } from "@/components/ui/button"
import { Github, Info } from "lucide-react"

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-[family-name:var(--font-space-grotesk)]">
              European Language Families
            </h1>
            <p className="text-muted-foreground font-[family-name:var(--font-dm-sans)]">
              Interactive visualization of language families and linguistic relationships.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" asChild>
              <a href="https://www.suzanailic.com/products" target="_blank" rel="noopener noreferrer">
                <Info className="w-4 h-4 mr-2" />
                About
              </a>
            </Button>

            <Button variant="outline" size="sm" asChild>
              <a href="https://github.com/suzana-ilic/v0-language-families" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                Source
              </a>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
