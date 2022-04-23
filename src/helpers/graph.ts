class Edge {
  private source: string
  private destination: string
  private rate: number
  private weight: number

  constructor(source: string, destination: string, rate: number) {
    this.source = source
    this.destination = destination
    this.rate = rate
    this.weight = -Math.log(this.rate)
  }
}

export class Graph {
  private vertices: any
  private edges: any[]

  constructor() {
    this.vertices = new Set()
    this.edges = []
  }

  private setVertex(vertex: string): void {
    this.vertices.add(vertex)
  }

  public setEdge(source: string, destination: string, rate: number) {
    this.setVertex(source)
    this.setVertex(source)
    this.edges.push(new Edge(source, destination, rate))
  }

  private getTotalPathRate(data: any, path: any) {
    let result = 1
    for (let i = 0; i < path.length - 1; i++) {
      result *= data[path[i]][path[i + 1]]
    }
    return result
  }

  private getPathRates(data: any, path: any) {
    const final = []
    let result = 1
    for (let i = 0; i < path.length - 1; i++) {
      result *= data[path[i]][path[i + 1]]
      final.push({
        source: path[i],
        destination: path[i + 1],
        rate: data[path[i]][path[i + 1]],
        total: result
      })
    }
    return final
  }
  public getMaxNegativeCycle(data: any, start_node: any) {
    let dist: any = {}
    let parent: any = {}

    // Step 1: Initialize distances from src to all other vertices as INFINITE
    for (let i of this.vertices) {
      dist[i] = Number.MAX_VALUE
      parent[i] = -1
    }

    // Set  start_node to 0
    dist[start_node] = 0

    // Step 2: Relax all edges |V| - 1 times.
    // A simple shortest path from src to any other vertex can have at-most |V| - 1 edges
    for (let i = 0; i < this.vertices.size; i++) {
      for (let j in this.edges) {
        let u = this.edges[j].src
        let v = this.edges[j].dest
        let weight = this.edges[j].weight
        if (dist[u] != Number.MAX_VALUE && dist[u] + weight < dist[v]) {
          dist[v] = dist[u] + weight
          parent[v] = u
        }
      }
    }

    // Step 3: check for negative-weight cycles.
    // The above step guarantees shortest distances if graph doesn't contain negative weight cycle. If we get a shorter path, then there is a cycle.
    let maxArbitragePath = []
    let maxArbitrageRate = 1
    for (let i = 0; i < this.vertices.size; i++) {
      for (let j in this.edges) {
        let srcNode = this.edges[j].src
        let destNode = this.edges[j].dest
        let weight = this.edges[j].weight
        if (
          dist[srcNode] != Number.MAX_VALUE &&
          dist[srcNode] + weight < dist[destNode]
        ) {
          dist[destNode] = dist[srcNode] + weight
          parent[destNode] = srcNode
          if (destNode === start_node) {
            const path: any = []
            let current = destNode
            while (current.length && !path.includes(current)) {
              path.unshift(current)
              current = parent[current]
            }
            path.unshift(destNode)
            let pathCost = this.getTotalPathRate(data, path)
            if (pathCost > maxArbitrageRate) {
              maxArbitragePath = path
              maxArbitrageRate = pathCost
            }
          }
        }
      }
    }
    if (maxArbitragePath) {
      return this.getPathRates(data, maxArbitragePath)
    } else {
      return []
    }
  }
}
