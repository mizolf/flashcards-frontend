import { CardResponse, CreateCardRequest } from '../models/Card.dto';
import { CreateDeckRequest, DeckDetailResponse, DeckResponse } from '../models/Deck.dto';

type DeckStore = Omit<DeckDetailResponse, 'cardCount'>;

let deckIdSeq = 2;
let cardIdSeq = 3;

const decks: DeckStore[] = [
  {
    id: 1,
    name: 'Sample Deck',
    isPublic: true,
    createdAt: new Date().toISOString(),
    ownerUsername: 'demo',
    cards: [
      { id: 1, question: 'What is Angular?', answer: 'A front-end framework.', tag: 'tech', difficulty: 2 },
      { id: 2, question: 'What is TypeScript?', answer: 'A typed superset of JavaScript.', tag: 'tech', difficulty: 1 }
    ]
  }
];

export function listDecks(): DeckResponse[] {
  return decks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    isPublic: deck.isPublic,
    createdAt: deck.createdAt,
    cardCount: deck.cards.length
  }));
}

export function listPublicDecks(): DeckResponse[] {
  return listDecks().filter((deck) => deck.isPublic);
}

export function getDeckDetail(deckId: number): DeckDetailResponse | undefined {
  const deck = decks.find((item) => item.id === deckId);
  if (!deck) return undefined;
  return {
    id: deck.id,
    name: deck.name,
    isPublic: deck.isPublic,
    createdAt: deck.createdAt,
    ownerUsername: deck.ownerUsername,
    cardCount: deck.cards.length,
    cards: deck.cards
  };
}

export function createDeck(request: CreateDeckRequest): DeckResponse {
  const deck: DeckStore = {
    id: deckIdSeq++,
    name: request.name,
    isPublic: !!request.isPublic,
    createdAt: new Date().toISOString(),
    ownerUsername: 'demo',
    cards: []
  };
  decks.unshift(deck);
  return {
    id: deck.id,
    name: deck.name,
    isPublic: deck.isPublic,
    createdAt: deck.createdAt,
    cardCount: deck.cards.length
  };
}

export function updateDeck(deckId: number, request: CreateDeckRequest): DeckResponse | undefined {
  const deck = decks.find((item) => item.id === deckId);
  if (!deck) return undefined;
  deck.name = request.name;
  deck.isPublic = !!request.isPublic;
  return {
    id: deck.id,
    name: deck.name,
    isPublic: deck.isPublic,
    createdAt: deck.createdAt,
    cardCount: deck.cards.length
  };
}

export function deleteDeck(deckId: number): boolean {
  const index = decks.findIndex((item) => item.id === deckId);
  if (index === -1) return false;
  decks.splice(index, 1);
  return true;
}

export function listCards(deckId: number): CardResponse[] | undefined {
  const deck = decks.find((item) => item.id === deckId);
  return deck?.cards;
}

export function getCard(deckId: number, cardId: number): CardResponse | undefined {
  const deck = decks.find((item) => item.id === deckId);
  return deck?.cards.find((card) => card.id === cardId);
}

export function createCard(deckId: number, request: CreateCardRequest): CardResponse | undefined {
  const deck = decks.find((item) => item.id === deckId);
  if (!deck) return undefined;
  const card: CardResponse = {
    id: cardIdSeq++,
    question: request.question,
    answer: request.answer,
    tag: request.tag,
    difficulty: request.difficulty
  };
  deck.cards.push(card);
  return card;
}

export function updateCard(
  deckId: number,
  cardId: number,
  request: CreateCardRequest
): CardResponse | undefined {
  const deck = decks.find((item) => item.id === deckId);
  const card = deck?.cards.find((item) => item.id === cardId);
  if (!card) return undefined;
  card.question = request.question;
  card.answer = request.answer;
  card.tag = request.tag;
  card.difficulty = request.difficulty;
  return card;
}

export function deleteCard(deckId: number, cardId: number): boolean {
  const deck = decks.find((item) => item.id === deckId);
  if (!deck) return false;
  const index = deck.cards.findIndex((item) => item.id === cardId);
  if (index === -1) return false;
  deck.cards.splice(index, 1);
  return true;
}
