import { Component, OnInit, ElementRef, ViewChild, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';
import { TreeNode } from '../../models/tree-node.model';

interface D3TreeNode extends d3.HierarchyPointNode<TreeNode> {
  _children?: D3TreeNode[];
  x0?: number;
  y0?: number;
}

@Component({
  selector: 'app-tree-visualization',
  standalone: true,
  template: `<div #treeContainer class="tree-container"></div>`,
  styleUrl: './tree-visualization.component.scss'
})
export class TreeVisualizationComponent implements OnInit, OnChanges {
  @ViewChild('treeContainer', { static: true }) treeContainer!: ElementRef;
  @Input() data: TreeNode | null = null;

  private svg: any;
  private g: any;
  private zoom: any;
  private root!: D3TreeNode;
  private treeLayout!: d3.TreeLayout<TreeNode>;
  private margin = { top: 40, right: 120, bottom: 40, left: 160 };
  private duration = 400;
  private i = 0;

  ngOnInit(): void {
    if (this.data) {
      this.initTree();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && this.data && this.treeContainer) {
      this.i = 0;
      this.initTree();
    }
  }

  private initTree(): void {
    if (!this.data) return;

    const container = this.treeContainer.nativeElement;
    d3.select(container).selectAll('*').remove();

    const width = container.offsetWidth || 1200;
    const height = container.offsetHeight || 800;

    this.treeLayout = d3.tree<TreeNode>()
      .nodeSize([35, 300])
      .separation((a, b) => (a.parent === b.parent ? 1 : 1.5));

    this.svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');

    this.zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 3])
      .on('zoom', (event) => {
        this.g.attr('transform', event.transform);
      });

    this.svg.call(this.zoom);

    this.g = this.svg.append('g')
      .attr('transform', `translate(${this.margin.left},${height / 2})`);

    this.root = d3.hierarchy(this.data) as D3TreeNode;
    this.root.x0 = 0;
    this.root.y0 = 0;

    // Collapse all children initially except root and first level
    if (this.root.children) {
      this.root.children.forEach((child: D3TreeNode) => this.collapse(child));
    }

    this.update(this.root);

    // Center the root
    const transform = d3.zoomIdentity
      .translate(this.margin.left, height / 2)
      .scale(0.85);
    this.svg.call(this.zoom.transform, transform);
  }

  private collapse(d: D3TreeNode): void {
    if (d.children) {
      (d as any)._children = d.children;
      (d as any)._children.forEach((child: D3TreeNode) => this.collapse(child));
      (d as any).children = null;
    }
  }

  private toggle(d: D3TreeNode): void {
    if (d.children) {
      (d as any)._children = d.children;
      (d as any).children = null;
    } else if ((d as any)._children) {
      (d as any).children = (d as any)._children;
      (d as any)._children = null;
    }
  }

  private update(source: D3TreeNode): void {
    const treeData = this.treeLayout(this.root);
    const nodes = treeData.descendants() as D3TreeNode[];
    const links = treeData.links();

    // ---- NODES ----
    const node = this.g.selectAll('g.node')
      .data(nodes, (d: any) => d.id || (d.id = ++this.i));

    // Enter new nodes at the source's previous position
    const nodeEnter = node.enter().append('g')
      .attr('class', 'node')
      .attr('transform', () => `translate(${source.y0},${source.x0})`)
      .on('click', (_event: any, d: D3TreeNode) => {
        this.toggle(d);
        this.update(d);
      })
      .style('cursor', (d: any) => (d.children || d._children) ? 'pointer' : 'default');

    nodeEnter.append('circle')
      .attr('r', 1e-6)
      .attr('class', (d: any) => {
        if (d.depth === 0) return 'node-root';
        if (d.children || d._children) return 'node-internal';
        return 'node-leaf';
      });

    // Collapse/expand indicator
    nodeEnter.append('text')
      .attr('class', 'toggle-icon')
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .style('font-size', '10px')
      .style('fill', 'white')
      .style('pointer-events', 'none');

    nodeEnter.append('text')
      .attr('class', 'node-label')
      .attr('dy', '0.35em')
      .attr('x', (d: any) => (d.children || d._children) ? -15 : 15)
      .attr('text-anchor', (d: any) => (d.children || d._children) ? 'end' : 'start')
      .text((d: any) => this.truncateLabel(d.data.name, d.depth))
      .style('fill-opacity', 1e-6)
      .append('title')
      .text((d: any) => d.data.name);

    // UPDATE: Transition nodes to new position
    const nodeUpdate = nodeEnter.merge(node);

    nodeUpdate.transition()
      .duration(this.duration)
      .attr('transform', (d: any) => `translate(${d.y},${d.x})`);

    nodeUpdate.select('circle')
      .attr('r', (d: any) => d.depth === 0 ? 8 : (d.children || d._children) ? 6 : 4)
      .attr('class', (d: any) => {
        if (d.depth === 0) return 'node-root';
        if (d._children) return 'node-collapsed';
        if (d.children) return 'node-internal';
        return 'node-leaf';
      });

    nodeUpdate.select('.toggle-icon')
      .text((d: any) => {
        if (!d.children && !d._children) return '';
        return d._children ? '+' : '−';
      });

    nodeUpdate.select('.node-label')
      .style('fill-opacity', 1)
      .attr('x', (d: any) => (d.children || d._children) ? -15 : 15)
      .attr('text-anchor', (d: any) => (d.children || d._children) ? 'end' : 'start');

    // EXIT: Transition exiting nodes to source's position
    const nodeExit = node.exit().transition()
      .duration(this.duration)
      .attr('transform', () => `translate(${source.y},${source.x})`)
      .remove();

    nodeExit.select('circle').attr('r', 1e-6);
    nodeExit.select('.node-label').style('fill-opacity', 1e-6);

    // ---- LINKS ----
    const link = this.g.selectAll('path.link')
      .data(links, (d: any) => d.target.id);

    const linkEnter = link.enter().insert('path', 'g')
      .attr('class', 'link')
      .attr('d', () => {
        const o = { x: source.x0!, y: source.y0! };
        return this.diagonal(o, o);
      });

    const linkUpdate = linkEnter.merge(link);

    linkUpdate.transition()
      .duration(this.duration)
      .attr('d', (d: any) => this.diagonal(d.source, d.target));

    link.exit().transition()
      .duration(this.duration)
      .attr('d', () => {
        const o = { x: source.x!, y: source.y! };
        return this.diagonal(o, o);
      })
      .remove();

    // Store old positions for transition
    nodes.forEach((d: D3TreeNode) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  }

  private diagonal(s: any, d: any): string {
    return `M${s.y},${s.x}
            C${(s.y + d.y) / 2},${s.x}
             ${(s.y + d.y) / 2},${d.x}
             ${d.y},${d.x}`;
  }

  private truncateLabel(name: string, depth: number): string {
    const maxLengths: Record<number, number> = { 0: 60, 1: 50, 2: 70, 3: 90 };
    const maxLen = maxLengths[depth] ?? 90;
    return name.length > maxLen ? name.substring(0, maxLen) + '...' : name;
  }
}
