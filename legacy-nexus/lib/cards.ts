import catalog from '@/public/data/cards.json';
export type Card = {id:string;season:number|string;name:string;rarity:string;url:string};
export const cards = (catalog as {cards:Card[]}).cards;
