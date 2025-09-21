import { Button } from "@/components/ui/button"
import { Download, Github, Info } from "lucide-react"

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
            <Button variant="outline" size="sm">
              <Info className="w-4 h-4 mr-2" />
              About
            </Button>
            
            <Button variant="outline" size="sm">
              <Github className="w-4 h-4 mr-2" />
              Source
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
