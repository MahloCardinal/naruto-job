'use strict';

class ControlLayout {
  constructor(options) {
    Object.assign(this, options);
  }
  measureFilterMenus(requests) {
    const layoutMeasurements = this.cache;
    if (!requests.length) return;
    const container = document.createElement('div');
    container.style.cssText =
      'position:fixed;left:-10000px;top:0;visibility:hidden;pointer-events:none;';
    const probes = requests.map(({ menu, key }) => {
      const probe = menu.cloneNode(true);
      probe.removeAttribute('id');
      probe.removeAttribute('popover');
      probe.style.cssText =
        'position:relative;inset:auto;display:block;width:max-content;max-width:none;max-height:none;';
      container.append(probe);
      return { probe, key };
    });
    document.body.append(container);
    const actions = probes.map(
      ({ probe }) => probe.querySelector('[data-filter-clear]').getBoundingClientRect().width
    );
    probes.forEach(({ probe }, i) =>
      probe.style.setProperty('--filter-action-width', actions[i] + 'px')
    );
    const measured = probes.map(({ probe, key }, i) => {
      const style = getComputedStyle(probe),
        border = parseFloat(style.borderLeftWidth) + parseFloat(style.borderRightWidth),
        padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight),
        gutter = probe.offsetWidth - probe.clientWidth - border;
      const content = Math.max(
        ...[...probe.children].map(row => {
          const rs = getComputedStyle(row);
          return (
            row.firstElementChild.getBoundingClientRect().width +
            actions[i] +
            parseFloat(rs.columnGap) +
            parseFloat(rs.paddingLeft) +
            parseFloat(rs.paddingRight)
          );
        })
      );
      return [
        key,
        { width: Math.ceil(content + padding + border + gutter + 1), action: actions[i] }
      ];
    });
    container.remove();
    for (const [key, value] of measured) layoutMeasurements.set(key, value);
  }
  sizeFilters() {
    const { cache: layoutMeasurements, translate: t, config: configFor, byId: $ } = this,
      language = this.language();
    const context = document.createElement('canvas').getContext('2d'),
      requests = [],
      missing = new Map();
    for (const button of document.querySelectorAll('[data-multi-filter]')) {
      const config = configFor(button.dataset.filterKey);
      const style = getComputedStyle(button),
        arrow = getComputedStyle(button.querySelector('.filter-arrow')),
        key =
          language + ':' + button.dataset.filterKey + ':' + style.font + ':' + style.letterSpacing;
      const menu = $(button.getAttribute('aria-controls'));
      requests.push({ button, config, style, arrow, key, menu });
      if (!layoutMeasurements.has(key) && !missing.has(key)) missing.set(key, { key, menu });
    }
    this.measureFilterMenus([...missing.values()]);
    const widths = requests.map(({ button, config, style, arrow, key, menu }) => {
      const measured = layoutMeasurements.get(key),
        textKey = key + ':counts';
      if (!layoutMeasurements.has(textKey)) {
        context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
        let textWidth = 0;
        for (let count = 2; count <= config.options.length; count++)
          textWidth = Math.max(
            textWidth,
            context.measureText(t('ui.selectedCount', { count })).width
          );
        context.font = `${arrow.fontWeight} ${arrow.fontSize} ${arrow.fontFamily}`;
        const spacing = [
          'paddingLeft',
          'paddingRight',
          'borderLeftWidth',
          'borderRightWidth',
          'columnGap'
        ].reduce((sum, key) => sum + (parseFloat(style[key]) || 0), 0);
        layoutMeasurements.set(
          textKey,
          Math.ceil(textWidth + context.measureText('▾').width + spacing + 2)
        );
      }
      return {
        button,
        menu,
        action: measured.action,
        width: Math.min(innerWidth - 20, Math.max(measured.width, layoutMeasurements.get(textKey)))
      };
    });
    const selectRequests = [],
      selectMissing = new Map();
    for (const select of document.querySelectorAll('.filters-panel select,#deck-sort')) {
      const style = getComputedStyle(select),
        key =
          'select:' +
          language +
          ':' +
          style.font +
          ':' +
          [...select.options].map(option => option.textContent).join('|');
      selectRequests.push({ select, key });
      if (!layoutMeasurements.has(key) && !selectMissing.has(key)) {
        const probe = select.cloneNode(true);
        probe.removeAttribute('id');
        probe.removeAttribute('class');
        Object.assign(probe.style, {
          position: 'fixed',
          left: '-9999px',
          visibility: 'hidden',
          width: 'auto',
          maxWidth: 'none',
          fieldSizing: 'fixed',
          font: style.font,
          fontWeight: '400'
        });
        selectMissing.set(key, probe);
      }
    }
    const fragment = document.createDocumentFragment();
    for (const probe of selectMissing.values()) fragment.append(probe);
    document.body.append(fragment);
    const selectWidths = [...selectMissing].map(([key, probe]) => [
      key,
      Math.ceil(probe.getBoundingClientRect().width) + 10
    ]);
    for (const probe of selectMissing.values()) probe.remove();
    for (const [key, width] of selectWidths) layoutMeasurements.set(key, width);
    for (const { button, menu, width, action } of widths) {
      const field = button.closest('.field');
      field.style.width = width + 'px';
      field.style.minWidth = width + 'px';
      menu.style.width = width + 'px';
      menu.style.setProperty('--filter-action-width', action + 'px');
    }
    for (const { select, key } of selectRequests)
      select.style.width = layoutMeasurements.get(key) + 'px';
  }
}
