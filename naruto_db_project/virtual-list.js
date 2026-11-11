'use strict';

// A variable-height window: logarithmic position lookup, bounded DOM, native scrolling.
class VirtualList {
  constructor({
    host,
    root,
    key,
    render,
    onMount = () => {},
    estimate = 340,
    gap = 14,
    overscan = 650
  }) {
    Object.assign(this, { host, root, key, render, onMount, estimate, gap, overscan });
    this.items = [];
    this.nodes = new Map();
    this.heights = new Map();
    this.active = false;
    this.tree = [];
    this.frame = null;
    this.measureFrame = null;
    this.pendingHeights = new Map();
    host.classList.add('virtual-list');
    this.scroll = event => {
      if (event.target === document || event.target === this.root()) this.schedule();
    };
    window.addEventListener('scroll', this.scroll, { capture: true, passive: true });
    this.observer = new ResizeObserver(entries => {
      for (const entry of entries)
        this.pendingHeights.set(
          entry.target,
          entry.borderBoxSize?.[0]?.blockSize ?? entry.target.getBoundingClientRect().height
        );
      if (this.measureFrame === null)
        this.measureFrame = requestAnimationFrame(() => {
          this.measureFrame = null;
          this.commitHeights();
        });
    });
  }
  setItems(items, { reset = false } = {}) {
    this.items = items;
    this.observer.disconnect();
    for (const node of this.nodes.values()) node.remove();
    this.nodes.clear();
    this.host.replaceChildren();
    this.pendingHeights.clear();
    this.tree = new Float64Array(items.length + 1);
    this.values = items.map(item => (this.heights.get(this.key(item)) || this.estimate) + this.gap);
    for (let i = 0; i < items.length; i++) this.addHeight(i, this.values[i]);
    this.updateHeight();
    if (reset) this.scrollToIndex(0);
    this.refresh();
  }
  addHeight(index, delta) {
    for (let i = index + 1; i < this.tree.length; i += i & -i) this.tree[i] += delta;
  }
  prefix(end) {
    let sum = 0;
    for (let i = end; i > 0; i -= i & -i) sum += this.tree[i];
    return sum;
  }
  indexAt(offset) {
    let index = 0,
      sum = 0,
      bit = 1;
    while (bit * 2 < this.tree.length) bit *= 2;
    for (; bit; bit >>= 1) {
      const next = index + bit;
      if (next < this.tree.length && sum + this.tree[next] <= offset) {
        sum += this.tree[next];
        index = next;
      }
    }
    return Math.min(index, Math.max(0, this.items.length - 1));
  }
  viewport() {
    const root = this.root(),
      box = this.host.getBoundingClientRect();
    return {
      top: Math.max(0, (root === window ? 0 : root.getBoundingClientRect().top) - box.top),
      height: root === window ? innerHeight : root.clientHeight
    };
  }
  updateHeight() {
    this.host.style.height = Math.max(0, this.prefix(this.items.length) - this.gap) + 'px';
  }
  setActive(active) {
    this.active = active;
    if (active) this.refresh();
  }
  schedule() {
    if (this.active && this.frame === null)
      this.frame = requestAnimationFrame(() => {
        this.frame = null;
        this.refresh();
      });
  }
  refresh() {
    if (!this.active || !this.items.length || !this.host.getClientRects().length) return;
    const { top, height } = this.viewport(),
      first = this.indexAt(Math.max(0, top - this.overscan)),
      last = this.indexAt(top + height + this.overscan),
      wanted = new Set();
    for (let i = first; i <= last; i++) wanted.add(i);
    for (const [i, node] of this.nodes) if (node.contains(document.activeElement)) wanted.add(i);
    for (const [i, node] of this.nodes)
      if (!wanted.has(i)) {
        this.observer.unobserve(node);
        node.remove();
        this.nodes.delete(i);
      }
    const mounted = [];
    let cursor = this.host.firstElementChild;
    for (const i of [...wanted].sort((a, b) => a - b)) {
      let node = this.nodes.get(i);
      if (!node) {
        const template = document.createElement('template');
        template.innerHTML = this.render(this.items[i]);
        node = template.content.firstElementChild;
        node.dataset.virtualIndex = i;
        node.setAttribute('aria-posinset', i + 1);
        node.setAttribute('aria-setsize', this.items.length);
        this.nodes.set(i, node);
        this.observer.observe(node);
        mounted.push(node);
      }
      if (node !== cursor) this.host.insertBefore(node, cursor);
      cursor = node.nextElementSibling;
      const top = this.prefix(i) + 'px';
      if (node.style.top !== top) node.style.top = top;
    }
    if (mounted.length) this.onMount(mounted);
  }
  commitHeights() {
    if (!this.active) {
      this.pendingHeights.clear();
      return;
    }
    const { top } = this.viewport(),
      anchor = this.indexAt(top),
      previousAnchor = this.prefix(anchor);
    for (const [node, height] of this.pendingHeights) {
      const i = Number(node.dataset.virtualIndex);
      if (this.nodes.get(i) !== node || height <= 0) continue;
      const delta = height + this.gap - this.values[i];
      if (Math.abs(delta) < 0.5) continue;
      this.values[i] += delta;
      this.addHeight(i, delta);
      this.heights.set(this.key(this.items[i]), height);
    }
    this.pendingHeights.clear();
    this.updateHeight();
    const correction = this.prefix(anchor) - previousAnchor;
    if (correction) {
      const root = this.root();
      if (root === window) window.scrollBy({ top: correction, behavior: 'instant' });
      else root.scrollTop += correction;
    }
    this.refresh();
  }
  invalidateMeasurements() {
    if (!this.items.length) {
      this.heights.clear();
      return;
    }
    const viewport = this.active ? this.viewport() : null,
      anchor = viewport ? this.indexAt(viewport.top) : 0,
      within = viewport ? viewport.top - this.prefix(anchor) : 0;
    this.heights.clear();
    this.tree = new Float64Array(this.items.length + 1);
    this.values = this.items.map(() => this.estimate + this.gap);
    for (let i = 0; i < this.values.length; i++) this.addHeight(i, this.values[i]);
    this.updateHeight();
    if (viewport) this.scrollToOffset(this.prefix(anchor) + Math.min(within, this.estimate - 1));
    this.refresh();
    for (const node of this.nodes.values())
      this.pendingHeights.set(node, node.getBoundingClientRect().height);
    this.commitHeights();
  }
  scrollToIndex(index) {
    if (!this.items.length) return;
    this.scrollToOffset(this.prefix(Math.max(0, Math.min(index, this.items.length - 1))));
    this.schedule();
  }
  scrollToOffset(offset) {
    const root = this.root(),
      rect = this.host.getBoundingClientRect();
    if (root === window)
      window.scrollTo({ top: window.scrollY + rect.top + offset, behavior: 'instant' });
    else root.scrollTop += rect.top - root.getBoundingClientRect().top + offset;
  }
}
