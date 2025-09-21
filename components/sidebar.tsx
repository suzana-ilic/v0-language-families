"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronRight, ChevronDown, Languages, Globe, BarChart3 } from "lucide-react"
import { calculateLanguageStatistics } from "./language-tree"

export function Sidebar({ onFamilyClick }: { onFamilyClick?: (familyName: string) => void }) {
  const [selectedFamily, setSelectedFamily] = useState<string | null>(null)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["families", "stats", "legend"]))

  const stats = calculateLanguageStatistics()
  const largestFamily = Object.entries(stats.familyBreakdown).reduce(
    (a, b) => (stats.familyBreakdown[a[0]] > stats.familyBreakdown[b[0]] ? a : b),
    ["", 0],
  )

  const languageFamilies = Object.entries(stats.familyBreakdown)
    .map((entry, index) => ({
      name: entry[0],
      count: entry[1],
      color: `bg-emerald-500` as const,
    }))
    .sort((a, b) => b.count - a.count) // Sort by count descending

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  return (
    <aside className="w-80 border-r border-border bg-card/30 backdrop-blur-sm p-4 space-y-4 overflow-y-auto max-h-screen">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-[family-name:var(--font-space-grotesk)] flex items-center gap-2">
            <Languages className="w-5 h-5 text-primary" />
            Language Families
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {languageFamilies.map((family) => (
            <Button
              key={family.name}
              variant={selectedFamily === family.name ? "secondary" : "ghost"}
              className="w-full justify-between h-auto p-3"
              onClick={() => {
                setSelectedFamily(selectedFamily === family.name ? null : family.name)
                onFamilyClick?.(family.name)
              }}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`w-3 h-3 rounded-full ${family.color} flex-shrink-0`} />
                <span className="font-[family-name:var(--font-dm-sans)] text-sm truncate">{family.name}</span>
              </div>
              <Badge variant="secondary" className="text-xs flex-shrink-0">
                {family.count}
              </Badge>
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-[family-name:var(--font-space-grotesk)] flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-500" />
              Statistics
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => toggleSection("stats")}>
              {expandedSections.has("stats") ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.has("stats") && (
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-[family-name:var(--font-dm-sans)]">
                Total Languages
              </span>
              <Badge variant="outline" className="text-white font-medium">
                {stats.totalLanguages}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-[family-name:var(--font-dm-sans)]">
                Language Families
              </span>
              <Badge variant="outline" className="text-white font-medium">
                {stats.totalFamilies}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-[family-name:var(--font-dm-sans)]">
                Living Languages
              </span>
              <Badge variant="outline" className="text-emerald-400 font-medium">
                {stats.livingLanguages}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground font-[family-name:var(--font-dm-sans)]">
                Extinct Languages
              </span>
              <Badge variant="outline" className="text-red-400 font-medium">
                {stats.extinctLanguages}
              </Badge>
            </div>
            <div className="border-t border-border pt-3 mt-3">
              <div className="text-sm text-muted-foreground mb-2">Largest Family:</div>
              <div className="text-cyan-400 font-medium">{largestFamily[0]}</div>
              <div className="text-xs text-muted-foreground">{largestFamily[1]} languages</div>
            </div>
            <div className="text-xs text-muted-foreground">
              Survival Rate: {Math.round((stats.livingLanguages / stats.totalLanguages) * 100)}%
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-[family-name:var(--font-space-grotesk)] flex items-center gap-2">
              <Globe className="w-5 h-5 text-accent" />
              Legend
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => toggleSection("legend")}>
              {expandedSections.has("legend") ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {expandedSections.has("legend") && (
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 border border-emerald-600"></div>
              <span className="text-sm font-[family-name:var(--font-dm-sans)]">Language Family</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-cyan-500 border border-cyan-600"></div>
              <span className="text-sm font-[family-name:var(--font-dm-sans)]">Sub-family</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500 border border-red-600"></div>
              <span className="text-sm font-[family-name:var(--font-dm-sans)]">Extinct Language</span>
            </div>
            <div className="text-xs text-muted-foreground mt-3 pt-2 border-t border-border">
              Click families to expand/collapse • Click languages to view Wikipedia • Hover for details
            </div>
          </CardContent>
        )}
      </Card>
    </aside>
  )
}
