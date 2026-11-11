'use strict';

class CardSearchIndex {
  constructor({ language, text, normalize, reference, number, level }) {
    Object.assign(this, { language, text, normalize, reference, number, level });
    this.records = new WeakMap();
    this.query = null;
    this.parsed = null;
  }
  matches(card, query, allLevels = false) {
    if (this.query !== query) {
      this.query = query;
      const index = /^#?(\d+)$/.exec(query),
        reference = /^(s\d+|es)(?:\s*(?:[#_-]|\s)\s*(\d*))?$/.exec(query);
      const set = reference?.[1];
      this.parsed = index || reference
        ? { set: set?.startsWith('s') ? 's' + Number(set.slice(1)) : set, digits: index?.[1] || reference?.[2] }
        : null;
    }
    const parsed = this.parsed;
    if (parsed) {
      const set = typeof card.season === 'number' ? 's' + card.season : card.season.toLowerCase();
      if (parsed.set && parsed.set !== set) return false;
      if (!parsed.digits) return true;
      const number = this.number(card);
      return parsed.digits.startsWith('0')
        ? String(number).padStart(3, '0').startsWith(parsed.digits)
        : number === Number(parsed.digits);
    }
    const language = this.language();
    let record = this.records.get(card);
    if (record?.language !== language) {
      const { name, ability, descriptions } = this.text(card);
      record = {
        language,
        fields: [name, ability, `${this.reference(card)} ${name}`].map(this.normalize),
        descriptions: descriptions.map(this.normalize)
      };
      this.records.set(card, record);
    }
    if (record.query !== query) {
      record.query = query;
      record.shared = record.fields.some(text => text.includes(query));
      record.levels = record.descriptions.map(text => text.includes(query));
    }
    return (
      record.shared ||
      (allLevels ? record.levels.some(Boolean) : record.levels[this.level(card) - 1])
    );
  }
}
