"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Card } from "@/components/ui/card"
import languageData from "@/data/languages.json"

interface LanguageNode {
  name: string
  proto?: string
  status?: string
  note?: string
  children?: LanguageNode[]
}

interface D3Node extends d3.HierarchyNode<LanguageNode> {
  x0?: number
  y0?: number
  _children?: D3Node[]
}

function getWikipediaUrl(languageName: string): string {
  // Clean up the language name for Wikipedia URL
  const cleanName = languageName
    .replace(/\s+/g, "_")
    .replace(/[()]/g, "")
    .replace(/,.*$/, "") // Remove everything after comma
    .trim()

  return `https://en.wikipedia.org/wiki/${encodeURIComponent(cleanName)}_language`
}

function isLanguage(node: D3Node): boolean {
  return !node.children && !node._children
}

function update(source: D3Node) {
  // Function to update the tree layout and rendering
}

export function LanguageTree({ focusFamily }: { focusFamily?: string }) {
  const svgRef = useRef<SVGSVGElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const [selectedNode, setSelectedNode] = useState<LanguageNode | null>(null)
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const rootRef = useRef<D3Node | null>(null)

  const zoomToFamily = (familyName: string) => {
    if (!rootRef.current || !svgRef.current || !zoomBehaviorRef.current) return

    const findNode = (node: D3Node): D3Node | null => {
      if (node.data.name === familyName) return node
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child as D3Node)
          if (found) return found
        }
      }
      if (node._children) {
        for (const child of node._children) {
          const found = findNode(child as D3Node)
          if (found) return found
        }
      }
      return null
    }

    const targetNode = findNode(rootRef.current)
    if (targetNode) {
      // Expand the target node if it's collapsed
      if (targetNode._children) {
        targetNode.children = targetNode._children
        targetNode._children = null
        update(targetNode)
      }

      // Zoom to the target node
      setTimeout(() => {
        const svg = d3.select(svgRef.current!)
        const scale = 1.5
        const translate = [
          svgRef.current!.clientWidth / 2 - scale * targetNode.y!,
          svgRef.current!.clientHeight / 2 - scale * targetNode.x!,
        ]
        svg
          .transition()
          .duration(750)
          .call(zoomBehaviorRef.current!.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
      }, 100)
    }
  }

  useEffect(() => {
    if (focusFamily) {
      zoomToFamily(focusFamily)
    }
  }, [focusFamily])

  useEffect(() => {
    if (!svgRef.current) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    const container = svgRef.current.parentElement!
    const width = container.clientWidth
    const height = container.clientHeight

    const margin = { top: 40, right: 40, bottom: 40, left: 40 }

    svg.attr("width", width).attr("height", height)

    const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`)

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 5])
      .on("zoom", (event) => {
        g.attr("transform", `translate(${margin.left},${margin.top}) ${event.transform}`)
      })

    zoomBehaviorRef.current = zoom
    svg.call(zoom)

    const root = d3.hierarchy(languageData as LanguageNode) as D3Node
    rootRef.current = root
    root.x0 = 0
    root.y0 = 0

    function collapseDeep(d: D3Node, depth = 0) {
      if (depth >= 3 && d.children) {
        d._children = d.children as D3Node[]
        d.children = null
      }
      ;(d.children || d._children || []).forEach((child: D3Node) => collapseDeep(child, depth + 1))
    }

    root.children?.forEach((child: D3Node) => collapseDeep(child))

    const dx = 25
    const dy = 180
    const treeLayout = d3.cluster<LanguageNode>().nodeSize([dx, dy])

    let i = 0

    function update(source: D3Node) {
      treeLayout(root)

      let left = Number.POSITIVE_INFINITY,
        right = Number.NEGATIVE_INFINITY
      root.each((d: D3Node) => {
        if (d.x! < left) left = d.x!
        if (d.x! > right) right = d.x!
      })

      const heightNeeded = right - left + margin.top + margin.bottom + 100
      svg.attr("height", Math.max(height, heightNeeded))

      const transition = svg.transition().duration(500).ease(d3.easeCubicInOut)

      const link = g.selectAll("path.link").data(root.links(), (d: any) => d.target.id || (d.target.id = ++i))

      link
        .join(
          (enter) =>
            enter
              .append("path")
              .attr("class", "link")
              .attr("fill", "none")
              .attr("stroke", "#10b981")
              .attr("stroke-opacity", 0.6)
              .attr("stroke-width", (d: any) => Math.max(1, 3 - d.target.depth))
              .attr("d", (d: any) => {
                const o = { x: source.x0!, y: source.y0! }
                return d3
                  .linkHorizontal<any, any>()
                  .x((d: any) => d.y)
                  .y((d: any) => d.x)({ source: o, target: o })
              }),
          (update) => update,
          (exit) =>
            exit
              .transition(transition)
              .remove()
              .attr("d", (d: any) => {
                const o = { x: source.x!, y: source.y! }
                return d3
                  .linkHorizontal<any, any>()
                  .x((d: any) => d.y)
                  .y((d: any) => d.x)({ source: o, target: o })
              }),
        )
        .transition(transition)
        .attr("stroke-width", (d: any) => Math.max(1, 3 - d.target.depth))
        .attr(
          "d",
          d3
            .linkHorizontal<any, any>()
            .x((d: any) => d.y)
            .y((d: any) => d.x),
        )

      const node = g.selectAll("g.node").data(root.descendants(), (d: any) => d.id || (d.id = ++i))

      const nodeEnter = node
        .enter()
        .append("g")
        .attr("class", (d: D3Node) => "node " + (d.children || d._children ? "internal" : "leaf"))
        .attr("transform", `translate(${source.y0},${source.x0})`)
        .style("cursor", "pointer")
        .on("click", (event, d: D3Node) => {
          // If it's a language (leaf node), open Wikipedia
          if (isLanguage(d)) {
            event.stopPropagation()
            const wikipediaUrl = getWikipediaUrl(d.data.name)
            window.open(wikipediaUrl, "_blank", "noopener,noreferrer")
          } else {
            // If it's a family/group node, expand/collapse
            if (d.children) {
              d._children = d.children as D3Node[]
              d.children = null
            } else {
              d.children = d._children as D3Node[]
              d._children = null
            }
            update(d)
          }
        })
        .on("mouseover", (event, d: D3Node) => {
          setSelectedNode(d.data)
          if (tooltipRef.current) {
            const tooltip = d3.select(tooltipRef.current)
            tooltip
              .style("opacity", 1)
              .style("left", event.pageX + 12 + "px")
              .style("top", event.pageY + 12 + "px")
          }
          d3.select(event.currentTarget)
            .select("circle")
            .transition()
            .duration(200)
            .attr("r", (d: D3Node) => (d.children || d._children ? 8 : 6))
            .attr("stroke-width", 3)
        })
        .on("mouseleave", (event) => {
          if (tooltipRef.current) {
            d3.select(tooltipRef.current).style("opacity", 0)
          }
          d3.select(event.currentTarget)
            .select("circle")
            .transition()
            .duration(200)
            .attr("r", (d: D3Node) => (d.children || d._children ? 6 : 4))
            .attr("stroke-width", 2)
        })

      nodeEnter
        .append("circle")
        .attr("r", (d: D3Node) => (d.children || d._children ? 6 : 4))
        .attr("fill", (d: D3Node) => {
          if (d.data.status === "extinct") return "#ef4444"
          const colors = ["#10b981", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899"]
          return colors[Math.min(d.depth, colors.length - 1)]
        })
        .attr("stroke", (d: D3Node) => {
          if (d.data.status === "extinct") return "#dc2626"
          const colors = ["#059669", "#0891b2", "#7c3aed", "#d97706", "#db2777"]
          return colors[Math.min(d.depth, colors.length - 1)]
        })
        .attr("stroke-width", 2)
        .attr("opacity", 0.9)

      nodeEnter
        .append("text")
        .attr("dy", "0.31em")
        .attr("x", (d: D3Node) => (d.children || d._children ? -12 : 12))
        .attr("text-anchor", (d: D3Node) => (d.children || d._children ? "end" : "start"))
        .attr("fill", (d: D3Node) => (d.data.status === "extinct" ? "#fca5a5" : "#ffffff"))
        .attr("font-size", (d: D3Node) => `${Math.max(10, 14 - d.depth)}px`)
        .attr("font-family", "var(--font-dm-sans)")
        .attr("font-weight", (d: D3Node) => (d.depth <= 1 ? "600" : "400"))
        .text((d: D3Node) => d.data.name)
        .style("text-shadow", "1px 1px 2px rgba(0,0,0,0.8)")
        .style("text-decoration", (d: D3Node) => (isLanguage(d) ? "underline" : "none"))
        .style("text-decoration-color", (d: D3Node) => (isLanguage(d) ? "#10b981" : "transparent"))

      const nodeUpdate = nodeEnter.merge(node as any)

      nodeUpdate.transition(transition).attr("transform", (d: D3Node) => `translate(${d.y},${d.x})`)

      node.exit().transition(transition).remove().attr("transform", `translate(${source.y},${source.x})`)

      root.each((d: D3Node) => {
        d.x0 = d.x!
        d.y0 = d.y!
      })
    }

    update(root)

    setTimeout(() => {
      if (zoomBehaviorRef.current) {
        const svg = d3.select(svgRef.current!)
        const bounds = svg.select("g").node()?.getBBox()
        if (bounds) {
          const width = svgRef.current!.clientWidth
          const height = svgRef.current!.clientHeight
          const scale = Math.min(width / bounds.width, height / bounds.height) * 0.9
          const translate = [
            width / 2 - scale * (bounds.x + bounds.width / 2),
            height / 2 - scale * (bounds.y + bounds.height / 2),
          ]
          svg
            .transition()
            .call(zoomBehaviorRef.current.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale))
        }
      }
    }, 500)
  }, [])

  return (
    <div className="relative w-full h-[calc(100vh-200px)]">
      <Card className="w-full h-full p-4 bg-slate-950 border-slate-800">
        <svg ref={svgRef} className="w-full h-full" style={{ background: "transparent" }} />
      </Card>

      <div
        ref={tooltipRef}
        className="absolute pointer-events-none bg-slate-900/95 border border-slate-700 rounded-lg p-4 text-sm opacity-0 transition-opacity z-20 max-w-sm backdrop-blur-sm"
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        {selectedNode && (
          <div className="space-y-3">
            <div className="font-semibold text-emerald-400 text-base border-b border-slate-700 pb-2">
              {selectedNode.name}
            </div>
            {selectedNode.proto && (
              <div className="space-y-1">
                <span className="text-slate-400 text-xs uppercase tracking-wide">Proto-Language:</span>
                <div className="text-cyan-300 font-medium">{selectedNode.proto}</div>
              </div>
            )}
            {selectedNode.status && (
              <div className="space-y-1">
                <span className="text-slate-400 text-xs uppercase tracking-wide">Status:</span>
                <div className="text-red-400 font-medium">{selectedNode.status}</div>
              </div>
            )}
            {selectedNode.note && (
              <div className="space-y-1">
                <span className="text-slate-400 text-xs uppercase tracking-wide">Note:</span>
                <div className="text-slate-200">{selectedNode.note}</div>
              </div>
            )}
            {!selectedNode.children && (
              <div className="text-xs text-emerald-400 border-t border-slate-700 pt-2">
                Click to view on Wikipedia →
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export function calculateLanguageStatistics() {
  const stats = {
    totalLanguages: 0,
    totalFamilies: 0,
    extinctLanguages: 0,
    livingLanguages: 0,
    familyBreakdown: {} as Record<string, number>,
  }

  function traverse(node: LanguageNode, isRoot = false, depth = 0) {
    // If this node has children, it's a family/group
    if (node.children && node.children.length > 0) {
      if (!isRoot) {
        if (depth === 1) {
          const languageCount = countLanguagesInFamily(node)
          stats.familyBreakdown[node.name] = languageCount
          stats.totalFamilies++
        }
      }

      // Recursively traverse children
      node.children.forEach((child) => traverse(child, false, depth + 1))
    } else {
      // This is a leaf node (actual language)
      stats.totalLanguages++
      if (node.status === "extinct") {
        stats.extinctLanguages++
      } else {
        stats.livingLanguages++
      }
    }
  }

  function countLanguagesInFamily(node: LanguageNode): number {
    if (!node.children || node.children.length === 0) {
      return 1 // This is a language
    }
    return node.children.reduce((count, child) => count + countLanguagesInFamily(child), 0)
  }

  traverse(languageData as LanguageNode, true, 0)
  return stats
}
