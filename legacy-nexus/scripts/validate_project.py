#!/usr/bin/env python3
"""Offline structural checks for the NEXUS source package (no network required)."""
from pathlib import Path
import json, re, sys
ROOT = Path(__file__).resolve().parents[1]
errors=[]
# Card catalog checks
card_doc=json.loads((ROOT/'data/cards.json').read_text(encoding='utf-8'))
cards=card_doc.get('cards', card_doc) if isinstance(card_doc, dict) else card_doc
ids=[c.get('id') for c in cards]
if len(cards)!=290: errors.append(f'Expected 290 cards, found {len(cards)}')
if len(set(ids))!=len(ids): errors.append('Duplicate card IDs')
for c in cards:
    for key in ('id','name','rarity','url','season'):
        if not c.get(key): errors.append(f"Card {c.get('id')} missing {key}")
# Check matching public copy
public_doc=json.loads((ROOT/'public/data/cards.json').read_text(encoding='utf-8'))
public_cards=public_doc.get('cards', public_doc) if isinstance(public_doc, dict) else public_doc
if cards != public_cards: errors.append('data/cards.json differs from public/data/cards.json')
# Migration order and essential workflows
migrations=sorted((ROOT/'supabase/migrations').glob('*.sql'))
expected=[f'{i:04d}_' for i in range(1,7)]
for prefix in expected:
    if not any(p.name.startswith(prefix) for p in migrations): errors.append(f'Missing migration {prefix}')
checks={
 '0002_nexus_workflows_and_card_catalog.sql':['create table public.card_catalog','decks_principal_card_catalog_fk'],
 '0003_community_and_updates_workflows.sql':['apply_as_collaborator','toggle_deck_like','review_update'],
 '0004_deck_and_tierlist_publication.sql':['submit_deck','review_deck','publish_tierlist'],
 '0005_content_write_hardening.sql':['revoke insert, update, delete','public.deck_cards','public.tierlist_entries'],
 '0006_update_submission.sql':['submit_update','update_submitted','jsonb_array_elements'],
}
for name,needles in checks.items():
    p=ROOT/'supabase/migrations'/name
    if not p.exists(): continue
    source=p.read_text(encoding='utf-8').lower()
    for needle in needles:
        if needle.lower() not in source: errors.append(f'{name}: missing expected statement {needle}')
# Environment template must not contain apparent live secrets.
env=(ROOT/'.env.example').read_text(encoding='utf-8')
for line in env.splitlines():
    if line.strip() and not line.lstrip().startswith('#') and '=' in line:
        value=line.split('=',1)[1].strip()
        if value and not value.startswith(('your_','https://your-','replace_','<')):
            errors.append('Unexpected non-placeholder value in .env.example')
if errors:
    print('FAIL')
    print('\n'.join('- '+e for e in errors))
    sys.exit(1)
print(f'OK: {len(cards)} cards; IDs unique; public catalog matches; migrations 0001–0006 present; core workflow markers found; no populated secrets in .env.example.')
